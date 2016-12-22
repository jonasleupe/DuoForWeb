import React, {Component} from 'react';
import IO from 'socket.io-client';
import Peer from 'peerjs';
import annyang from 'annyang';
import ReactPlayer from 'react-player';

import Video from '../components/Video';
import ResultImage from '../components/ResultImage';
import ResultWeb from '../components/ResultWeb';

class App extends Component {

  state = {
    youStream: undefined,
    strangerStream: undefined,
    voiceActive: false,
    voiceCommand: ``,
    result: `resultFalse`,
    askResult: ``,
    strangerSocketId: ``,
    mySocketId: ``
  }

  initPeer = () => {
    const {id} = this.socket;

    this.peer = new Peer(id, {
      host: `serene-inlet-24249.herokuapp.com`,
      port: ``,
      path: `/api`,
      secure: true
    });

    this.peer.on(`open`, () => {
      this.socket.emit(`search`);
    });

    this.peer.on(`call`, call => {
      const {youStream} = this.state;
      call.answer(youStream);

      call.on(`stream`, this.handleStrangerStream);
      call.on(`close`, this.handleCloseStream);
    });

  }

  handleCloseStream = () => {
    let {strangerStream} = this.state;
    strangerStream = undefined;

    this.socket.emit(`search`);

    this.setState({strangerStream});
  }

  handleStrangerStream = strangerStream => {
    this.setState({strangerStream});
  }

  handleWSFound = data => {
    const {youStream} = this.state;

    let {strangerSocketId, mySocketId} = this.state;
    strangerSocketId = data[1];
    mySocketId = data[0];
    this.setState({strangerSocketId, mySocketId});

    const call = this.peer.call(data[1], youStream);
    call.on(`stream`, this.handleStrangerStream);
    call.on(`close`, this.handleCloseStream);

  }

  searchBing = tag => {
    this.setState({voiceCommand: tag, result: `resultTrue`});

    fetch(`https://api.cognitive.microsoft.com/bing/v5.0/search?q=${tag}&count=1&offset=0&mkt=nl-NL&safesearch=Off`, {
      method: `GET`,
      headers: {
        Host: `api.cognitive.microsoft.com`,
        'Ocp-Apim-Subscription-Key': `65ddc224f4e34b6d8e55f319e66133a9`
      },
    })
    .then(r => r.json())
    .then(d => this.handleStopVoiceCommands(d));
  }

  searchBingImage = tag => {
    this.setState({voiceCommand: tag, result: `resultTrue`});

    fetch(`https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=${tag}&count=1&offset=0&mkt=nl-NL&safeSearch=Off`, {
      method: `GET`,
      headers: {
        Host: `api.cognitive.microsoft.com`,
        'Ocp-Apim-Subscription-Key': `65ddc224f4e34b6d8e55f319e66133a9`
      },
    })
    .then(r => r.json())
    .then(d => this.handleStopVoiceCommands(d));
  }

  showYoutube = tag => {
    this.setState({voiceCommand: tag, result: `resultTrue`});

    fetch(`https://api.cognitive.microsoft.com/bing/v5.0/videos/search?q=${tag}&count=1&offset=0&mkt=nl-NL&safeSearch=Off`, {
      method: `GET`,
      headers: {
        Host: `api.cognitive.microsoft.com`,
        'X-Frame-Options': `allow`,
        'Ocp-Apim-Subscription-Key': `65ddc224f4e34b6d8e55f319e66133a9`
      },
    })
    .then(r => r.json())
    .then(d => this.handleStopVoiceCommands(d));
  }

  explainMe = () => {
    const explaining = `If you are into cats, you can ask Google 'Show me cats'. But maybe you want to see a video? That's possible by asking 'Play cats'. But if you're that type of guy who's looking for just some information, you just ask it 'Search for cats'.`;
    this.setState({googleResult: explaining});
    this.setState({voiceCommand: `What can you do?`, result: `resultTrue`});
    this.handleStopVoiceCommands();
  }

  handleStartVoiceCommands = e => {
    e.preventDefault();
    this.setState({voiceActive: true, voiceCommand: ``, result: `resultFalse`});

    annyang.resume();

    const commands = {
      'search for *tag': this.searchBing,
      'play *tag': this.showYoutube,
      'show me *tag': this.searchBingImage,
      'What can you do': this.explainMe
    };

    annyang.addCommands(commands);
    annyang.setLanguage(`en-US`);
  }

  handleStopVoiceCommands = d => {
    if (d) {
      let {askResult} = this.state;
      askResult = d;
      this.setState({askResult});
      this.setState({voiceActive: false});
      annyang.abort();
      this.handleClickYo(askResult);
    } else {
      this.setState({voiceActive: false});
      annyang.abort();
    }
  }

  handleWSYo = data => {
    let {askResult, voiceCommand, result} = this.state;
    askResult = data[0];
    voiceCommand = data[3];
    result = `resultTrue`;
    this.setState({askResult, voiceCommand, result});
  }

  handleClickYo = askResult => {
    const {strangerSocketId, mySocketId, voiceCommand} = this.state;
    const socketInfo = [askResult, strangerSocketId, mySocketId, voiceCommand];
    this.socket.emit(`yo`, socketInfo);
  }

  handleInputChange = () => {
    console.log(`todo; if input changed, new api call`);
  }

  initStream() {
    navigator.getUserMedia (
      {audio: true, video: true},
      this.handleYouStream,
      this.handleYouStreamError
    );
  }

  handleYouStream = youStream => {
    this.setState({youStream});
  }

  handleYouStreamError = e => console.error(e);

  handleMySocketId = data => {
    let {mySocketId} = this.state;
    mySocketId = data;
    this.setState({mySocketId});
  };

  componentDidMount() {
    this.initStream();
    this.socket = IO(`/`);
    this.socket.on(`connect`, this.initPeer);
    this.socket.on(`found`, this.handleWSFound);
    this.socket.on(`yo`, this.handleWSYo);
    this.socket.on(`connected`, this.handleMySocketId);
  }

  render() {
    const {youStream, strangerStream, voiceActive, voiceCommand, result, askResult} = this.state;

    let connected = false;
    let googleResponse;
    let googleQuestion;


    if (askResult) {
      if (askResult._type === `Images`) {
        googleQuestion = `Show me ${  voiceCommand}`;
        googleResponse = <ResultImage link={askResult.value[0].contentUrl} alt={askResult.value[0].name} title={askResult.value[0].name} />;
      } else if (askResult._type === `Videos`) {
        googleQuestion = `Play ${  voiceCommand}`;
        googleResponse = <ReactPlayer url={askResult.value[0].contentUrl} playing className='youtube' />;
      } else if (askResult._type === `SearchResponse`) {
        googleQuestion = `Search for ${  voiceCommand}`;
        googleResponse = <ResultWeb link={askResult.webPages.value[0].url} name={askResult.webPages.value[0].name} />;
      }
    }

    if (strangerStream === undefined) {
      connected = `strangerNotConnected`;
    } else {
      connected = `strangerConnected`;
    }

    return (
      <main>
          <Video stream={youStream} muted={`true`} connected={connected} />
          <Video stream={strangerStream} muted={`false`} connected='youStream' />

          {voiceActive ? (
            <button className={`google voiceActive`} onClick={this.handleStopVoiceCommands}></button>
          ) : (
            <button className={`google`} onClick={this.handleStartVoiceCommands}></button>
          )}

          <div className={`googleResult ${result}`}>
            <div className='speakResult'>
              <input type='text' className={`result_text ${result}`} onChange={this.handleInputChange} placeholder={googleQuestion} />
            </div>
            <div className='searchResult'>
              {googleResponse}
            </div>
          </div>
      </main>
    );
  }
}

export default App;
