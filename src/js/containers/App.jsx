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
    voiceCommand: ``
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
    // '/' gaat verbinden met de server waar het op draait
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
    console.log(`click`);

    this.setState({voiceActive: true});

    annyang.setLanguage(`nl-NL`);
    annyang.addCallback(`result`, function(userSaid) {
      console.log(userSaid[0]);
      this.setState({voiceCommand: userSaid[0]});
      console.log(this);
      //setState({voiceCommand: userSaid[0]});
      // fetch(`https://www.googleapis.com/customsearch/v1?q=${userSaid[0]}&cref=https%3A%2F%2Fcse.google.com%3A443%2Fcse%2Fpublicurl%3Fcx%3D006195244337884894805%3Axugllpj1yoc&cx=006195244337884894805%3Axugllpj1yoc&lr=lang_nl&num=1&key=AIzaSyBaS5tmO3A2z27-fHnJofcMVP94ikmfLUQ`)
      //   .then(r => r.json())
      //   .then(d => console.log(d));
    }.bind(this));

    annyang.start();
  }

  handleStopVoiceCommands = e => {
    e.preventDefault();
    this.setState({voiceActive: false});
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
    const {youStream, strangerStream, voiceActive, voiceCommand} = this.state;
    console.log(voiceCommand);

    return (
      <main>
          <Video stream={youStream} muted={`true`} />
          <Video stream={strangerStream} muted={`false`} />
          {voiceActive ? (
            <button className='google' onClick={this.handleStopVoiceCommands}></button>
          ) : (
            <button className='google' onClick={this.handleStartVoiceCommands}></button>
          )}
          <div className='result'><p className='result_text'>{voiceCommand}</p></div>
      </main>
    );
  }
}

export default App;
