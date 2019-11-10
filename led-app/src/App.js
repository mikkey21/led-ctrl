import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
//import './App.css';
import './remote.css';

const client = new W3CWebSocket('ws://192.168.1.85:8000');


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUsers: [],
      userActivity: [],
      username: null,
      ledColor: '15',
      text: '',
      value: 180
    };
    this.sendMsg = this.sendMsg.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }
  
  handleMouseUp(event) {
    console.log('Change Color'+event.target.value);
    var localColor = this.state.value;
    console.log("Send Message, color: "+localColor);
    const data = {content: "Another New Message"};
    client.send(JSON.stringify({
      ...data,
      ledColor: localColor,
      type: 'contentchange'
    }));
  }

  handleTouchEnd(event) {
    console.log('Touch End Change Color'+event.target.value);
    var localColor = this.state.value;
    console.log("Send Message, color: "+localColor);
    const data = {content: "Another New Message"};
    client.send(JSON.stringify({
      ...data,
      ledColor: localColor,
      type: 'contentchange'
    }));
  }
  

 componentDidMount() {
   console.log('I was triggered during component mount');
   client.onopen = () => {
     console.log('WebSocket Client Connected');
   };
   client.onmessage = (message) => {
     console.log(message);
     const dataFromServer = JSON.parse(message.data);
     console.log(dataFromServer);
     console.log('json ledColor: '+dataFromServer.ledColor);
     const msgLedColor = parseInt(dataFromServer.ledColor,10);
     console.log('led color'+msgLedColor);
     this.setState({ledColor: msgLedColor});
   };
 }

  sendMsg() {
    var localColor = this.state.ledColor;
    console.log("Send Message, color: "+localColor);
    const data = {content: "Another New Message"};
    client.send(JSON.stringify({
      ...data,
      ledColor: localColor,
      type: 'contentchange'
    }));
  }

  render() {  
    return (
      <div className="app_div">
	<p className="app_headline"> Amandas LED Remote </p>
	<button className="btn" onClick={this.sendMsg}> Update LED </button>
	<p className="slide_text"> {this.state.value} </p>
	<input
	  id="typeinp"
	  type="range"
	  min="0" max="359"
	  value={this.state.value}
	  onChange={this.handleChange}
	  onMouseUp={this.handleMouseUp}
	  onTouchEnd={this.handleTouchEnd}
	  step="1"/>
      </div>
    );
  }
}

export default App;
