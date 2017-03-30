import React, { Component } from 'react';
import logo from './logo.svg';
import io from 'socket.io-client';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      lobbyId: '',
      joinLobbyId: '',
      players: [],
      ws: io(),
      create: true,
      started: false,
      day: true
    };

    this.handleLobby = this.handleLobby.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleLobbyName = this.handleLobbyName.bind(this)
    this.toggleCreateLobby = this.toggleCreateLobby.bind(this)
    this.skipVote = this.skipVote.bind(this)
    this.readyUp = this.readyUp.bind(this)
  }

  handleLobby(event) {
    const self = this
    const socket = this.state.ws
    // this.setState({ws: socket})

    // either a lobby create or lobby join
    if(self.state.create){
      socket.emit('create', {username: self.state.username})
    } else {
      socket.emit('join', {username: self.state.username, lobbyId: self.state.joinLobbyId})
      self.setState({lobbyId: self.state.joinLobbyId})
    }

    /*
      join: a player joined your lobby
      vote: a vote from a player, for another player to die
      kill: a witch casting a kill spell
      turn: changing from day to night
    */

    socket.on('created', function(ioEvent){
      self.setState({lobbyId: ioEvent.lobbyId})
    })

    socket.on('playerUpdate', function(ioEvent){
      self.setState({players: ioEvent.players})
    })

    socket.on('start', function(){
      self.setState({started: true})
    })

    socket.on('day', function(){
      self.setState({day: true})
    })

    socket.on('night', function(){
      self.setState({day: false})
    })

    socket.on('disconnect', function(){

    });

    event.preventDefault()
  }

  toggleCreateLobby(event) {
    let newState = !this.state.create
    this.setState({create: newState})
  }

  handleNameChange(event) {
    this.setState({username: event.target.value})
  }

  handleLobbyName() {
    this.setState({joinLobbyId: event.target.value})
  }

  skipVote() {
    this.state.ws.emit('submitVote', {skip: true, lobbyId: this.state.lobbyId, from: this.state.username})
  }

  readyUp() {
    this.state.ws.emit('ready', {lobbyId: this.state.lobbyId})
  }

  render() {
    let lobbyField = null
    let self = this
    if (!this.state.create) {
      lobbyField = <label>
            Lobby Name:
            <input type="text" value={this.state.joinLobbyId} onChange={this.handleLobbyName} />
          </label>
    }

    let playerCardList = this.state.players.map(function(player){
      return <UserCard day={self.state.day} ready={self.state.started} ws={self.state.ws} lobbyId={self.state.lobbyId} player={player} from={self.state.username} />
    })

    let dayNight = this.state.day ? "day" : "night"

    let startGame = this.state.started ? <div><h2>{dayNight}</h2><button onClick={this.skipVote}>Skip Vote</button></div> : <button onClick={this.readyUp}>Start Game</button>

    let intro = <div>
      <h2>Game: {this.state.lobbyId}</h2>
      {startGame}
    </div>

    if (this.state.lobbyId === '') {
      intro = <div>
        <button onClick={this.toggleCreateLobby}>{this.state.create ? 'Join Lobby' : 'Create Lobby'}</button>
        <form onSubmit={this.handleLobby}>
          <label>
            Name:
            <input type="text" value={this.state.username} onChange={this.handleNameChange} />
          </label>
          {lobbyField}
          <input type="submit" value="Submit" />
        </form>
      </div>
    }

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Witch Hunt</h2>
        </div>
        {intro}
        {playerCardList}
      </div>
    );
  }
}

class UserCard extends React.Component {
  constructor(props) {
    super(props)
    this.handleVote = this.handleVote.bind(this)
  }

  handleVote(event) {
    if(!this.props.ready || !this.props.day){
      return
    }
    this.props.ws.emit('submitVote', {username: this.props.player.username, lobbyId: this.props.lobbyId, from: this.props.from})
  }

  render() {
    return (
      <div onClick={this.handleVote}>{this.props.player.username} {this.props.player.killVote.length.toString()} {this.props.player.isDead.toString()}</div>
    );
  }
}

export default App;
