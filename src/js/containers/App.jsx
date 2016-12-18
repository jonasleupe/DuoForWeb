import React, {Component} from 'react';
import IO from 'socket.io-client';
import Peer from 'peerjs';
import annyang from 'annyang';
import ReactPlayer from 'react-player';

import Video from '../components/Video';
import ResultVideo from '../components/ResultVideo';
import ResultImage from '../components/ResultImage';
import ResultWeb from '../components/ResultWeb';

class App extends Component {

  state = {
    youStream: undefined,
    strangerStream: undefined,
    voiceActive: false,
    voiceCommand: ``,
    result: `resultFalse`,
    askResult: ``
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

  handleWSFound = strangerId => {
    const {youStream} = this.state;

    const call = this.peer.call(strangerId, youStream);
    call.on(`stream`, this.handleStrangerStream);
    call.on(`close`, this.handleCloseStream);

  }

  initSocket() {
    this.socket = IO(`/`);
    this.socket.on(`connect`, this.initPeer);
    this.socket.on(`found`, this.handleWSFound);
  }

  handleYouStream = youStream => {
    this.setState({youStream});
    this.initSocket();
  }

  handleYouStreamError = e => console.error(e);

  searchBing = tag => {
    console.log(`de google search is ${tag}`);

    this.setState({voiceCommand: tag, result: `resultTrue`});

    // fetch(`https://www.googleapis.com/customsearch/v1?q=${tag}&cref=https%3A%2F%2Fcse.google.com%3A443%2Fcse%2Fpublicurl%3Fcx%3D006195244337884894805%3Axugllpj1yoc&cx=006195244337884894805%3Axugllpj1yoc&lr=lang_nl&num=1&key=AIzaSyBaS5tmO3A2z27-fHnJofcMVP94ikmfLUQ`)
    //     .then(r => r.json())
    //     .then(d => this.setState({askResult: d}));

    fetch(`https://api.cognitive.microsoft.com/bing/v5.0/search?q=${tag}&count=1&offset=0&mkt=nl-NL&safesearch=Off`, {
      method: `GET`,
      headers: {
        Host: `api.cognitive.microsoft.com`,
        'Ocp-Apim-Subscription-Key': `65ddc224f4e34b6d8e55f319e66133a9`
      },
    })
    .then(r => r.json())
    .then(d => this.setState({askResult: d}));



    this.handleStopVoiceCommands();
  }

  searchBingImage = tag => {
    console.log(`de google image search is ${tag}`);
    this.setState({voiceCommand: tag, result: `resultTrue`});

    fetch(`https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=${tag}&count=1&offset=0&mkt=nl-NL&safeSearch=Off`, {
      method: `GET`,
      headers: {
        Host: `api.cognitive.microsoft.com`,
        'Ocp-Apim-Subscription-Key': `65ddc224f4e34b6d8e55f319e66133a9`
      },
    })
    .then(r => r.json())
    .then(d => this.setState({askResult: d}));

    this.handleStopVoiceCommands();
  }

  showYoutube = tag => {
    console.log(`de youtube search is ${tag}`);
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
    .then(d => this.setState({askResult: d}));

    this.handleStopVoiceCommands();
  }

  handleStartVoiceCommands = e => {
    e.preventDefault();
    this.setState({voiceActive: true, voiceCommand: ``, result: `resultFalse`});

    annyang.start();

    const commands = {
      'search for *tag': this.searchBing,
      'play *tag': this.showYoutube,
      'show me *tag': this.searchBingImage
    };

    annyang.addCommands(commands);
    annyang.setLanguage(`nl-NL`);
  }

  handleStopVoiceCommands = () => {
    this.setState({voiceActive: false});
    annyang.abort();
  }

  initStream() {
    navigator.getUserMedia (
      {audio: true, video: true},
      this.handleYouStream,
      this.handleYouStreamError
    );
  }

  componentDidMount() {
    this.initStream();
  }

  render() {
    const {youStream, strangerStream, voiceActive, voiceCommand, result, askResult} = this.state;

    let connected = false;
    let googleResponse;

    if (askResult) {
      switch (askResult._type) {
      case `Images`:
        googleResponse = <ResultImage link={askResult.value[0].contentUrl} alt={askResult.value[0].name} title={askResult.value[0].name} />;
        break;
      case `Videos`:
        googleResponse = <ReactPlayer url={askResult.value[0].contentUrl} playing className='youtube' />;
        console.log(askResult.value[0]);
        break;
      default:
        googleResponse = <ResultWeb link={askResult.webPages.value[0].url} name={askResult.webPages.value[0].name} />;
        break;
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

          <div className='googleResult'>
            <div className='speakResult'>
              <p className={`result_text ${result}`}>{voiceCommand}</p>
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
