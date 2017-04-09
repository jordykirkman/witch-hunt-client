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
      username:           '',
      user:               {},
      lobbyId:            '',
      joinLobbyId:        '',
      instructions:       null,
      playerNotification: null,
      players:            [],
      ws:                 io(),
      create:             true,
      started:            false,
      winner:             null,
      time:               'dawn'
    };

    this.handleLobby        = this.handleLobby.bind(this)
    this.handleLobbyName    = this.handleLobbyName.bind(this)
    this.handleNameChange   = this.handleNameChange.bind(this)
    this.playerNotification = this.playerNotification.bind(this)
    this.readyUp            = this.readyUp.bind(this)
    this.skipVote           = this.skipVote.bind(this)
    this.toggleCreateLobby  = this.toggleCreateLobby.bind(this)
    
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

    // changes the game turn from dawn -> day -> night 
    socket.on('turn', function(ioEvent){
      self.setState({time: ioEvent.time})
      self.setState({instructions: ioEvent.instructions})
    })

    socket.on('revealed', function(ioEvent){
      self.playerNotification.call(this, ioEvent.role)
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
    this.state.ws.emit('submitVote', {skip: true, lobbyId: this.state.lobbyId, from: this.state.user.id})
  }

  readyUp() {
    this.state.ws.emit('ready', {lobbyId: this.state.lobbyId})
  }

  // a notification for this player received
  playerNotification(notification){
    let self = this
    this.setState({playerNotification: notification})
    // decay after 4 seconds
    setTimeout(function(){
      self.setState({playerNotification: null})      
    }, 4000)
  }

  render() {
    let self = this

    let skippedPlayers = this.state.players.filter(function(player){
      return player.skip
    })

    let playerCardList = this.state.players.map(function(player){
      return <UserCard time={self.state.time} ready={self.state.started} ws={self.state.ws} lobbyId={self.state.lobbyId} player={player} user={self.state.user} />
    })

    let intro = <div className="columns">
      <div className="column">
        {this.state.started && this.state.time === 'day' &&
          <div>
            <h3>{this.state.time}</h3>
            <a className="button is-primary" onClick={this.skipVote}>Skip Vote</a>{skippedPlayers.length.toString()}
          </div>
        }
      </div>
    </div>

    if (this.state.lobbyId === '') {
      intro = <div>
        <div className="columns is-multiline">
          <div className="column is-12">

            <div className="tabs is-centered">
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
      <div className={`App is-${this.state.time}`}>
        {this.state.playerNotification &&
          <span className="player-notification">
            {this.state.playerNotification}
          </span>
        }
        <section className='hero is-medium is-bold transparent'>
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
            <div className={`columns is-mobile is-multiline`}>
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
    this.state = {
      showRole: false
    }
    this.handleVote = this.handleVote.bind(this)
  }

  handleVote(event) {
    let self = this
    // do nothing if the game hasnt started yet
    if(!this.props.ready){
      return
    }
    // if it's you, remind yourself of your role
    if(this.props.player.id === this.props.user.id){
      this.setState({showRole: true})
      setTimeout(function(){
        self.setState({showRole: false})
      }, 4000)
      return
    }
    // send a kill if it's night and you are a monster
    if(this.props.time === 'night' && this.props.player.id !== this.props.user.id && this.props.user.role === 'witch'){
      this.props.ws.emit('kill', {username: this.props.player.id, lobbyId: this.props.lobbyId, from: this.props.from})
      return
    }
    // reveal a role if it's dawn and you are a prophet
    if(this.props.time === 'dawn' && this.props.player.id !== this.props.user.id && this.props.user.role === 'prophet'){
      this.props.ws.emit('reveal', {username: this.props.player.id, lobbyId: this.props.lobbyId, from: this.props.user.id})
    }
    // send a kill/unkill vote if it's day
    if(this.props.time === 'day'){
      this.props.ws.emit('submitVote', {username: this.props.player.id, lobbyId: this.props.lobbyId, from: this.props.user.id})
    }
  }

  render() {
    let classes = 'notification is-primary',
      myCard    = this.props.player.id === this.props.user.id

    classes = myCard ? `${classes} is-success` : classes
    classes = myCard && this.props.user.role === 'witch' && this.props.time === 'night' ? `${classes} is-danger` : classes
    classes = myCard && this.props.user.role === 'prophet' && this.props.time === 'dawn' ? `${classes} is-warning` : classes

    return (
      <div className="column is-half-mobile is-one-third-tablet is-one-quarter-desktop" onClick={this.handleVote}>
        <div className={classes}>
          <div className="title">{this.props.player.username}{myCard ? '(you)' : ''}</div>
          <div className="subtitle">
            {this.props.player['isDead'] &&
              <h2>💀 {this.props.player.role}</h2>
            }
            {!this.props.player['isDead'] &&
              <p>alive {this.props.player.killVote.length.toString()}</p>
            }
            {this.state.showRole &&
              <p>{this.props.player.role}</p>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
