import React, { Component } from 'react';
import logo from './logo.svg';
import io from 'socket.io-client';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // ws: io('http://localhost:3000'),
      username: '',
      lobbyId: '',
      joinLobbyId: '',
      players: [],
      ws: io(),
      create: true,
      day: true
    };

    this.handleLobby = this.handleLobby.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleLobbyName = this.handleLobbyName.bind(this)
    this.toggleCreateLobby = this.toggleCreateLobby.bind(this)
    this.handleVote = this.handleVote.bind(this)
    // this.intro = this.intro.bind(this)
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

    socket.on('joined', function(ioEvent){
      // let playerArray = self.state.players
      // playerArray.push({username: ioEvent.username, isDead: false, killVote: 0})
      self.setState({players: ioEvent.players})
    })

    socket.on('vote', function(ioEvent){
      // let playerArray = self.state.players
      // for(let n = 0; n < playerArray.length; n++){
      //   if(playerArray[n].username === ioEvent.username){
      //     playerArray[n].vote += 1
      //   }
      // }
      self.setState({players: ioEvent.players})
    })

    socket.on('playerUpdate', function(ioEvent){
      // let playerIsDead = ioEvent.username['isDead']
      // self.setState({playerIsDead: true})
      self.setState({players: ioEvent.players})
    })

    socket.on('turn', function(ioEvent){
      let currentTime = !self.state.day
      self.setState({day: currentTime})
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

  handleVote(event) {
    console.log(event)
  }

  // intro(props) {
  //   console.log(event)
  // }

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
      return <UserCard ws={self.state.ws} lobbyId={self.state.lobbyId} player={player} from={self.state.username} />
    })

    let dayNight = this.state.day ? "day" : "night"

    let intro = <div>
      <h2>Game: {this.state.lobbyId}</h2>
      {dayNight}
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
    this.props.ws.emit('submitVote', {username: this.props.player.username, lobbyId: this.props.lobbyId, from: this.props.from})
    // console.log(this.props.username)
  }

  render() {
    return (
      <div onClick={this.handleVote}>{this.props.player.username} {this.props.player.killVote} {this.props.player.isDead.toString()}</div>
    );
  }
}

export default App;
