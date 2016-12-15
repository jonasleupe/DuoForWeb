import React, {Component} from 'react';
import IO from 'socket.io-client';
import Peer from 'peerjs';
import annyang from 'annyang';

import Video from '../components/Video';

class App extends Component {

  state = {
    youStream: undefined,
    strangerStream: undefined
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

  initStream() {
    navigator.getUserMedia (
      {audio: true, video: true},
      this.handleYouStream,
      this.handleYouStreamError
    );
  }

  componentDidMount() {
    this.initStream();

    if (annyang) {
      const commands = {
        // test: function() {console.log(`Test`);},
        // 'voeg *tag toe': this.setUrl
        hello: function() { alert(`Hello world!`); }
      };

      annyang.addCommands(commands);

      // annyang.addCallback(`result`, function(userSaid) {
      //   console.log(`User said: ${userSaid}`);
      // });

      //annyang.addCallback(`end`, function() {console.log(`Sound detection has ended.`);});

      annyang.setLanguage(`nl-NL`);
      annyang.start();
    }

  }

  render() {
    const {youStream, strangerStream} = this.state;

    return (
      <main>
          <Video stream={youStream} muted={`true`} />
          <Video stream={strangerStream} muted={`false`} />
      </main>
    );
  }
}

export default App;
