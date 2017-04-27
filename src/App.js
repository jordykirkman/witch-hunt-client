import React, { Component } from 'react';
import farmLogo from './farm.svg';
import sunLogo from './sun.svg';
import moonLogo from './moon.svg';
import dawnLogo from './dawn.svg';
import witchesLogo from './witches.svg';
import villagersLogo from './villagers.svg';
import instructionsImage from './images/instructions.png';
import io from 'socket.io-client';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      botCount:           0,
      username:           '',
      user:               {},
      lobbyId:            '',
      joinLobbyId:        '',
      instructions:       null,
      playerNotification: null,
      showNotification:   false,
      notificationClass:  '',
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
    this.handleBotCount     = this.handleBotCount.bind(this)
    this.playerNotification = this.playerNotification.bind(this)
    this.readyUp            = this.readyUp.bind(this)
    this.skipVote           = this.skipVote.bind(this)
    this.joinLobby          = this.joinLobby.bind(this)
    this.toggleCreateLobby  = this.toggleCreateLobby.bind(this)
  }

  componentDidMount() {
    const socket = this.state.ws
    const token = window.localStorage.getItem('witch-hunt')
    const self = this
    socket.on('connect', function(){
      console.log('connected', socket.id)
      if(token){
        self.handleLobby.call(self, null, token)
      }
    })
  }

  handleLobby(event, token) {
    const self = this
    const socket = this.state.ws

    if(token){
      let lobbyId = JSON.parse(token).lobbyId
      let userId = JSON.parse(token).userId
      socket.emit('reconnectClient', {userId: userId, lobbyId: lobbyId})
    }

    socket.on('joined', function(ioEvent){
      self.setState({lobbyId: ioEvent.lobbyId})
      let session = JSON.stringify({lobbyId: ioEvent.lobbyId, userId: ioEvent.userId})
      window.localStorage.setItem('witch-hunt', session);
    })

    socket.on('playerUpdate', function(ioEvent){
      // find and update my user reference
      for(let n =0; n < ioEvent.players.length; n++){
        if(ioEvent.players[n]['id'] === socket.id){
          self.setState({user: ioEvent.players[n]})
        }
      }
      self.setState({players: ioEvent.players})
    })

    // changes something about the game state
    socket.on('gameUpdate', function(ioEvent){
      // if we are updating the player list
      if(ioEvent.players){
        // find and update my user reference
        for(let n =0; n < ioEvent.players.length; n++){
          if(ioEvent.players[n]['id'] === socket.id){
            self.setState({user: ioEvent.players[n]})
          }
        }
      }
      // update the game state like normal
      self.setState(ioEvent)
    })

    socket.on('notification', function(ioEvent){
      self.playerNotification.call(this, ioEvent.notification, ioEvent.messageClass)
    })

    socket.on('disconnect', function(){

    });
  }

  toggleCreateLobby(event) {
    let newState = !this.state.create
    this.setState({create: newState})
  }

  handleNameChange(event) {
    this.setState({username: event.target.value})
  }

  handleBotCount(event) {
    this.setState({botCount: event.target.value})
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

  joinLobby(e){
    e.preventDefault()
    // either a lobby create or lobby join
    if(this.state.create){
      this.state.ws.emit('create', {username: this.state.username, botCount: this.state.botCount})
    } else {
      this.state.ws.emit('join', {username: this.state.username, lobbyId: this.state.joinLobbyId})
    }
  }

  // a notification for this player received
  playerNotification(notification, messageClass){
    let self = this
    this.setState({playerNotification: notification, notificationClass: messageClass})
    setTimeout(function(){
      self.setState({showNotification: true})
    }, 100)
    setTimeout(function(){
      self.setState({showNotification: false})      
    }, 4000)
    // decay after 4 seconds
    setTimeout(function(){
      self.setState({playerNotification: null})      
    }, 5000)
  }

  render() {
    let self = this,
      settingClass = this.state.lobbyId.split('-')[1]


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
            <h3>{skippedPlayers.length.toString()} votes to skip</h3>
            <a className="button is-primary" onClick={this.skipVote}>Skip</a>
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
            <form onSubmit={this.joinLobby}>
              <div className="field">
                <label className="label">Name</label>
                <p className="control">
                  <input className="input" type="text" placeholder="Your Name" value={this.state.username} onChange={this.handleNameChange}/>
                </p>
              </div>
              <div className="field">
                <p className="control">
                  <span className="select">
                    <select onChange={this.handleBotCount}>
                      <option>0</option>
                      <option>2</option>
                      <option>4</option>
                      <option>6</option>
                    </select>
                  </span>
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
                  <input className="button is-primary" type="submit" value="Submit" onClick={this.handleLobby}/>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    let gameIcon = witchesLogo
    if(this.state.winner === 'villagers'){
      gameIcon = villagersLogo
    }
    let timeIcon = dawnLogo
      if(this.state.time === 'day'){
        timeIcon = sunLogo
      }
      if(this.state.time === 'night'){
        timeIcon = moonLogo
      }

    return (
      <div className={`App container is-${this.state.time} ${settingClass}`}>
        <div className='column'>
          {this.state.playerNotification &&
            <div className={`player-notification ${this.state.notificationClass} ${this.state.showNotification ? 'show' : ''}`}>
              <div className='player-notification-text'>
                {this.state.playerNotification}
              </div>
            </div>
          }
          <div className="column">
            {this.state.winner &&
              <div className="game-state-icon">
                <img src={gameIcon} className="App-logo winner" alt="logo" />
                <h2>{this.state.winner}</h2>
              </div>
            }
            {!this.state.winner && this.state.lobbyId &&
              <div className="game-state-icon">
                <img src={timeIcon} className="App-logo time-icon" alt="logo" />
                <img src={farmLogo} className="farm-icon" alt="logo" />
              </div>
            }
            {!this.state.lobbyId &&
              <div className="lobby-name">
                Witch Hunt
                <img className="instructions-image" src={instructionsImage}/>
              </div>
            }
            {this.state.lobbyId &&
              <div className="lobby-name">{this.state.lobbyId}</div>
            }
            {this.state.started === false && this.state.user.isCreator && this.state.players.length >= 4 &&
              <button className="button is-primary" onClick={this.readyUp}>Start Game</button>
            }
            {this.state.user.isCreator && this.state.players.length >= 4 && this.state.winner &&
              <button className="button is-primary" onClick={this.readyUp}>Play again</button>
            }
            {this.state.instructions &&
              <div className="instructions">{this.state.instructions}</div>
            }
            {this.state.players.length < 4 && this.state.lobbyId !== '' &&
              <h3>{this.state.players.length}/4 players ready</h3>
            }
          </div>
          <div className="column">
            {intro}
            <div className={`columns is-mobile is-multiline`}>
              {playerCardList}
            </div>
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
      this.props.ws.emit('kill', {user: this.props.player.id, lobbyId: this.props.lobbyId, from: this.props.from})
      return
    }
    // reveal a role if it's dawn and you are a prophet
    if(this.props.time === 'dawn' && this.props.player.id !== this.props.user.id && this.props.user.role === 'prophet'){
      this.props.ws.emit('reveal', {user: this.props.player.id, lobbyId: this.props.lobbyId, from: this.props.user})
    }
    // send a kill/unkill vote if it's day
    if(this.props.time === 'day'){
      this.props.ws.emit('submitVote', {user: this.props.player.id, lobbyId: this.props.lobbyId, from: this.props.user.id})
    }
  }

  render() {
    let myCard    = this.props.player.id === this.props.user.id,
      myCardClass = myCard ? 'is-me' : '',
      myDeadClass = this.props.player.isDead ? 'is-dead' : 'is-alive'

    return (
      <div className="column is-half-mobile is-one-third-tablet is-one-third-desktop" onClick={this.handleVote}>
        <div className={`notification info-card ${myCardClass} info-card-${this.props.player.role} ${myDeadClass} is-${this.props.time}`}>
          <div className="title">{myCard ? '(you)' : ''}{this.props.player.username}</div>
          <div className="subtitle">
            {this.props.player.isDead || this.state.showRole &&
              <div className="player-role">
                {this.props.player.role}
              </div>
            }
            {!this.props.player.isDead &&
              <div className="vote-count">
                {this.props.player.killVote.length.toString()}
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
