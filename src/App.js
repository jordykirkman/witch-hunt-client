import React, { Component } from 'react';
import logo from './logo.svg';
import io from 'socket.io-client';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {ws: null, username: '', lobbyName: '', players: {}, create: false};

    this.handleLobby = this.handleLobby.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.toggleCreateLobby = this.toggleCreateLobby.bind(this);
  }

  handleLobby(event) {
    this.setState({lobbyName: event.target.value});

    var socket = io('http://localhost:3000');
    this.setState({ws: socket});

    // either a lobby create or lobby join
    socket.on('connect', function(){
      if(this.state.create){
        socket.send({eventName: 'create', username: this.state.username});
      } else {
        socket.send({eventName: 'join', username: this.state.username, lobbyName: this.state.lobbyName});
      }
    });

    /*
      join: a player joined your lobby
      vote: a vote from a player, for another player to die
      kill: a witch casting a kill spell
      turn: changing from day to night
    */
    socket.on('event', function(data){
      switch(data.eventName){
        case 'turn':
          this.state.players.push({username: data.username})
        break;
        case 'join':
          this.state.players[data.username] = {username: data.username, isDead: false, killVote: 0}
        break;
        case 'vote':
          this.state.players[data.username]['killVote'] += 1;
        break;
        case 'kill':
          this.state.players[data.username]['isDead'] = true;
        break;
      }
    });

    socket.on('disconnect', function(){

    });

    event.preventDefault();
  }

  toggleCreateLobby(event) {
    let newState = !this.state.create;
    this.setState({create: newState});
  }

  handleNameChange(event) {
    this.setState({username: event.target.value});
  }

  render() {
    let lobbyField = null;
    if (this.state.create) {
      lobbyField = <label>
            Lobby Name:
            <input type="text" value={this.state.username} onChange={this.handleLobbyChange} />
          </label>
    }

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Witch Hunt</h2>
        </div>

        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={this.toggleCreateLobby}>{this.state.create ? 'Create Lobby' : 'Join Lobby'}</button>
        <form onSubmit={this.handleLobby}>
          <label>
            Name:
            <input type="text" value={this.state.username} onChange={this.handleNameChange} />
          </label>
          {lobbyField}
          <input type="submit" value="Submit" />
        </form>

      </div>
    );
  }
}

/*class JoinLobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {lobbyName: null, ws: null};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({lobbyName: event.target.value});
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.}
      </button>
    );
  }
}

class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }*/
// }

export default App;
