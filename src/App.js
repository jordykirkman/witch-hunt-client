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
      winner: null,
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

    socket.on('end', function(ioEvent){
      self.setState({winner: ioEvent.winner})
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

    let skippedPlayers = this.state.players.filter(function(player){
      return player.skip
    })

    let playerCardList = this.state.players.map(function(player){
      return <UserCard day={self.state.day} ready={self.state.started} ws={self.state.ws} lobbyId={self.state.lobbyId} player={player} from={self.state.username} />
    })

    let dayNight = this.state.day ? "day" : "night"

    let intro = <div className="columns">
      <div className="column">
        <h2>Game: {this.state.lobbyId}</h2>
        {this.state.started &&
          <div>
            <h2>{dayNight}</h2>
            <a className="button is-primary" onClick={this.skipVote}>Skip Vote</a>{skippedPlayers.length.toString()}
          </div>
        }
        {!this.state.started &&
          <button className="button is-primary" onClick={this.readyUp}>Start Game</button>
        }
      </div>
    </div>

    if (this.state.lobbyId === '') {
      intro = <div>
        <div className="columns is-multiline">
          <div className="column is-12">

            <div className="tabs is-boxed">
              <ul>
                <li className={this.state.create ? 'is-active' : ''}>
                  <a onClick={this.toggleCreateLobby}>
                    <span>Create</span>
                  </a>
                </li>
                <li className={!this.state.create ? 'is-active' : ''}>
                  <a onClick={this.toggleCreateLobby}>
                    <span>Join</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>
          <div className="column is-12">
            <div className="field">
              <label className="label">Name</label>
              <p className="control">
                <input className="input" type="text" placeholder="Text input" value={this.state.username} onChange={this.handleNameChange}/>
              </p>
            </div>
            {!this.state.create &&
              <div className="field">
                <label className="label">Game Name</label>
                <p className="control">
                  <input className="input" type="text" placeholder="Text input" value={this.state.joinLobbyId} onChange={this.handleLobbyName}/>
                </p>
              </div>
            }
            <div className="field">
              <p className="control">
                <a className="button is-primary" type="submit" value="Submit" onClick={this.handleLobby}>Play</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    }

    if (this.state.winner) {
      intro = <h2>{this.state.winner} win</h2>
    }

    return (
      <div className="App">
        <section className="hero is-medium is-primary is-bold">
          <div className="hero-body">
            <div class="container">
              <img src={logo} className="App-logo" alt="logo" />
              <h2 className="title">Witch Hunt</h2>
            </div>
          </div>
        </section>
          <div className="container">
            {intro}
            <div className={this.state.day ? 'columns is-multiline is-day' : 'columns is-multiline is-night'}>
              {playerCardList}
            </div>
          </div>
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
    // do nothing if the game hasnt started yet
    if(!this.props.ready){
      return
    }
    // send a kill if it's night and you are a monster
    if(!this.props.day && this.props.player.username === this.props.from && this.props.player.role === 'witch'){
      this.props.ws.emit('kill', {username: this.props.player.username, lobbyId: this.props.lobbyId, from: this.props.from})
      return
    }
    this.props.ws.emit('submitVote', {username: this.props.player.username, lobbyId: this.props.lobbyId, from: this.props.from})
  }

  render() {
    return (
      <div className="column is-half-mobile is-one-third-tablet is-one-quarter-desktop" onClick={this.handleVote}>
        <div className={this.props.player.username === this.props.from ? 'notification is-primary' : 'notification is-secondary'}>
          <div className="title">{this.props.player.username}{this.props.player.username === this.props.from ? '(you)' : ''}</div>
          <div className="subtitle">
            {this.props.player.isDead &&
              'KILLED'
            }
            {!this.props.player.isDead &&
              <span>alive {this.props.player.killVote.length.toString()}</span>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
