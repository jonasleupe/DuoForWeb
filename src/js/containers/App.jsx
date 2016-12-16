import React, {Component} from 'react';
import IO from 'socket.io-client';
import Peer from 'peerjs';
import annyang from 'annyang';

import Video from '../components/Video';

class App extends Component {

  state = {
    youStream: undefined,
    strangerStream: undefined,
    voiceActive: false,
    voiceCommand: ``,
    result: `resultFalse`,
    googleResult: ``
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

  handleStartVoiceCommands = e => {
    e.preventDefault();
    this.setState({voiceActive: true, voiceCommand: ``, result: `resultFalse`});

    annyang.start();
    annyang.setLanguage(`nl-NL`);

    annyang.addCallback(`result`, function(userSaid) {
      this.setState({voiceCommand: userSaid[0], result: `resultTrue`});
      fetch(`https://www.googleapis.com/customsearch/v1?q=${userSaid[0]}&cref=https%3A%2F%2Fcse.google.com%3A443%2Fcse%2Fpublicurl%3Fcx%3D006195244337884894805%3Axugllpj1yoc&cx=006195244337884894805%3Axugllpj1yoc&lr=lang_nl&num=1&key=AIzaSyBaS5tmO3A2z27-fHnJofcMVP94ikmfLUQ`)
        .then(r => r.json())
        .then(d => this.setState({googleResult: d}));
      console.log(annyang);
      this.handleStopVoiceCommands();
    }.bind(this));


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
    const {youStream, strangerStream, voiceActive, voiceCommand, result, googleResult} = this.state;


    let connected = false;
    let googleResponse, googleLink;

    if (googleResult) {
      googleResponse = googleResult.items[0].title;
      googleLink = googleResult.items[0].link;
      console.log(googleResult.items[0]);
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
              <a className={`result_text googleLink ${result}`} href={googleLink} target='_blank'>{googleResponse}</a>
            </div>
          </div>
      </main>
    );
  }
}

export default App;
