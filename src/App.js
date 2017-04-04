import React, { Component } from 'react';
import logo from './farm.svg';
import witchesLogo from './witches.svg';
import villagersLogo from './villagers.svg';
import io from 'socket.io-client';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username:     '',
      user:         {},
      lobbyId:      '',
      joinLobbyId:  '',
      instructions: null,
      players:      [],
      ws:           io(),
      create:        true,
      started:      false,
      winner:       null,
      day:          true
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
      // find and update my user reference
      for(let n =0; n < ioEvent.players.length; n++){
        if(ioEvent.players[n].username === self.state.username){
          self.setState({user: ioEvent.players[n]})
        }
      }
      self.setState({players: ioEvent.players})
    })

    socket.on('start', function(){
      self.setState({started: true})
    })

    socket.on('day', function(ioEvent){
      self.setState({day: true})
      self.setState({instructions: ioEvent.instructions})
    })

    socket.on('night', function(ioEvent){
      self.setState({day: false})
      self.setState({instructions: ioEvent.instructions})
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
    let self = this

    let skippedPlayers = this.state.players.filter(function(player){
      return player.skip
    })

    let playerCardList = this.state.players.map(function(player){
      return <UserCard day={self.state.day} ready={self.state.started} ws={self.state.ws} lobbyId={self.state.lobbyId} player={player} user={self.state.user} />
    })

    let dayNight = this.state.day ? "day" : "night"

    let intro = <div className="columns">
      <div className="column">
        {this.state.started &&
          <div>
            <h3>{dayNight}</h3>
            <a className="button is-primary" onClick={this.skipVote}>Skip Vote</a>{skippedPlayers.length.toString()}
          </div>
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
                <input className="input" type="text" placeholder="Your Name" value={this.state.username} onChange={this.handleNameChange}/>
              </p>
            </div>
            {!this.state.create &&
              <div className="field">
                <label className="label">Game Name</label>
                <p className="control">
                  <input className="input" type="text" placeholder="Lobby Id" value={this.state.joinLobbyId} onChange={this.handleLobbyName}/>
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

    let title = <h3>Witch Hunt</h3>
    if (this.state.winner) {
      title = <h3>{this.state.winner} win</h3>
    }

    let icon = logo
    if(this.state.winner === 'witches'){
      icon = witchesLogo
    } else if(this.state.winner === 'villagers'){
      icon = villagersLogo
    }

    return (
      <div className={this.state.day ? 'App is-day' : 'App is-night'}>
        <section className={this.state.day ? 'hero is-medium is-bold is-day' : 'hero is-medium is-bold is-night'}>
          <div className="hero-body">
            <div className="container column">
              <img src={icon} className="App-logo" alt="logo" />
              {title}
              <h2>{this.state.lobbyId}</h2>
              {this.state.user.isCreator && this.state.players.length >= 4 && !this.state.started &&
                <button className="button is-primary" onClick={this.readyUp}>Start Game</button>
              }
              {this.state.instructions &&
                <h3>{this.state.instructions}</h3>
              }
              {this.state.players.length < 4 && this.state.lobbyId !== '' &&
                <h3>{this.state.players.length}/4 players ready</h3>
              }
            </div>
          </div>
        </section>
          <div className="container column">
            {intro}
            <div className={this.state.day ? 'columns is-mobile is-multiline is-day' : 'columns is-mobile is-multiline is-night'}>
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
    if(!this.props.day && this.props.player.username !== this.props.user.username && this.props.user.role === 'witch'){
      this.props.ws.emit('kill', {username: this.props.player.username, lobbyId: this.props.lobbyId, from: this.props.from})
      return
    }
    // send a kill/unkill vote if it's day
    if(this.props.day){
      this.props.ws.emit('submitVote', {username: this.props.player.username, lobbyId: this.props.lobbyId, from: this.props.user.username})
    }
  }

  render() {
    return (
      <div className="column is-half-mobile is-one-third-tablet is-one-quarter-desktop" onClick={this.handleVote}>
        <div className={this.props.player.username === this.props.user.username ? 'notification is-success' : 'notification is-primary'}>
          <div className="title">{this.props.player.username}{this.props.player.username === this.props.user.username ? '(you)' : ''}</div>
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
