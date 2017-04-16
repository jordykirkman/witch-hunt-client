import React, { Component } from 'react';
import farmLogo from './farm.svg';
import sunLogo from './sun.svg';
import moonLogo from './moon.svg';
import dawnLogo from './dawn.svg';
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
    } else {
      // either a lobby create or lobby join
      if(self.state.create){
        socket.emit('create', {username: self.state.username})
      } else {
        console.log('join')
        socket.emit('join', {username: self.state.username, lobbyId: self.state.joinLobbyId})
        self.setState({lobbyId: self.state.joinLobbyId})
      }
    }

    /*
      join: a player joined your lobby
      vote: a vote from a player, for another player to die
      kill: a witch casting a kill spell
      turn: changing from day to night
    */

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

    socket.on('start', function(ioEvent){
      self.setState({
        username:           '',
        instructions:       null,
        playerNotification: null,
        started:            true,
        winner:             null,
        time:               'dawn'
      })
    })

    // changes the game turn from dawn -> day -> night 
    socket.on('turn', function(ioEvent){
      self.setState({time: ioEvent.time})
      self.setState({instructions: ioEvent.instructions})
    })

    socket.on('notification', function(ioEvent){
      self.playerNotification.call(this, ioEvent.role)
    })

    socket.on('end', function(ioEvent){
      self.setState({winner: ioEvent.winner})
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
    this.setState({playerNotification: notification, showNotification: true})
    setTimeout(function(){
      self.setState({showNotification: false})      
    }, 4000)
    // decay after 4 seconds
    setTimeout(function(){
      self.setState({playerNotification: null})      
    }, 5000)
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
            <form onSubmit={this.handleLobby}>
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
                <input className="button is-primary" type="submit" value="Submit" onClick={this.handleLobby}/>
              </p>
            </div>
            </form>
          </div>
        </div>
      </div>
    }

    let title = <h3>Witch Hunt</h3>
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
      <div className={`App is-${this.state.time}`}>
        {this.state.playerNotification &&
          <div className={`player-notification ${this.state.showNotification ? 'show' : ''}`}>
            <span className="player-notification-text">
              {this.state.playerNotification} Cast Failed
            </span>
          </div>
        }
        <section className='hero is-medium is-bold transparent'>
          <div className="hero-body">
            <div className="container column">
              {this.state.winner &&
                <div class="game-state-icon">
                  <img src={gameIcon} className="App-logo winner" alt="logo" />
                  <h2>{this.state.winner}</h2>
                </div>
              }
              {!this.state.winner &&
                <div class="game-state-icon">
                  <img src={timeIcon} className="App-logo time-icon" alt="logo" />
                  <img src={farmLogo} className="farm-icon" alt="logo" />
                </div>
              }
              {title}
              <h2>{this.state.lobbyId}</h2>
              {this.state.user.isCreator && this.state.players.length >= 4 && !this.state.started &&
                <button className="button is-primary" onClick={this.readyUp}>Start Game</button>
              }
              {this.state.user.isCreator && this.state.players.length >= 4 && this.state.winner &&
                <button className="button is-primary" onClick={this.readyUp}>Play again</button>
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
    let classes = 'notification info-card-villager',
      myCard    = this.props.player.id === this.props.user.id

    classes = myCard ? 'notification info-card-villager is-me' : classes
    classes = myCard && this.props.user.role === 'witch' && this.props.time === 'night' ? 'notification info-card-witch' : classes
    classes = myCard && this.props.user.role === 'prophet' && this.props.time === 'dawn' ? 'notification info-card-prophet' : classes

    return (
      <div className="column is-half-mobile is-one-third-tablet is-one-quarter-desktop" onClick={this.handleVote}>
        <div className={classes}>
          <div className="title">{myCard ? '(you)' : ''}{this.props.player.username}</div>
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
