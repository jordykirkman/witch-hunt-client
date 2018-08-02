import React,{ Component }  from 'react';
import Particle             from './classes/particle.js';
import LobbyLink            from './classes/lobby-link.js';
import PlayerCard           from './classes/player-card';
import TrialCard            from './classes/trial-card';
import GameIcon             from './classes/game-icon';
import Intro                from './classes/intro';
import Instructions         from './classes/instructions';
import MessageArea          from './classes/message-area';
import { defaultState }     from './state-defaults';
import io                   from 'socket.io-client';
import                           './index.scss';

// images
import smokeTexture         from './images/smoke_white.png';
import checkmark            from './images/checkmark.svg';

// sounds can enable these when theres a native wrapper
// import door_creak from './sounds/door_creak.mp3'
// import cup_drop from './sounds/cup_drop.mp3'
// import twig_snap from './sounds/twig_snap.mp3'
// import glass_drop from './sounds/glass_drop.mp3'
// import branch_break from './sounds/branch_break.mp3'

let particles = []
let canvasContext

class App extends Component {
  constructor(props) {
    super(props)
    this.state                = defaultState
    this.handleLobby          = this.handleLobby.bind(this)
    this.handleLobbyName      = this.handleLobbyName.bind(this)
    this.handleNameChange     = this.handleNameChange.bind(this)
    this.handleBotCount       = this.handleBotCount.bind(this)
    this.playerNotification   = this.playerNotification.bind(this)
    this.readyUp              = this.readyUp.bind(this)
    this.skipVote             = this.skipVote.bind(this)
    this.stayHome             = this.stayHome.bind(this)
    this.joinLobby            = this.joinLobby.bind(this)
    this.leaveLobby           = this.leaveLobby.bind(this)
    this.toggleCreateLobby    = this.toggleCreateLobby.bind(this)

    this.generateRandom       = this.generateRandom.bind(this)
    this.draw                 = this.draw.bind(this)
    this.update               = this.update.bind(this)

  }

  componentDidMount() {
    const socket  = this.state.ws,
      token       = window.localStorage.getItem('witch-hunt'),
      self        = this,
      query       = window.location.search.substring(1),
      qvars       = query.split("="),
      qlobbyId    = qvars[1]

    if(qlobbyId){
      this.setState({joinLobbyId: qlobbyId, create: false})
    }

    if(token){
      self.handleLobby(null, null, token)
    }

    // Update the count down every 1 second
    let x = setInterval(function() {
      if(self.state.timer > 0){
        self.setState({timer: self.state.timer - 1})
      }
    }, 1000);

    let canvas      = document.getElementById('canvas'),
      appContainer  = document.getElementById('root'),
      imageObj      = new Image(),
      particleCount = 20,
      maxVelocity   = 1.5,
      canvasWidth   = appContainer.offsetWidth <= 600 ? appContainer.offsetWidth : 600,
      canvasHeight  = 350,
      targetFPS     = 33,
      mistSettings  = {
      particles:      particles,
      particleCount:  particleCount,
      maxVelocity:    maxVelocity,
      targetFPS:      targetFPS,
      canvasWidth:    canvasWidth,
      canvasHeight:   canvasHeight
    }

    this.setState({mistSettings: mistSettings})

    // Once the image has been downloaded then set the image on all of the particles
    imageObj.onload = function() {
      particles.forEach(function(particle) {
        particle.setImage(imageObj);
      })
    }

    // Once the callback is arranged then set the source of the image
    imageObj.src = smokeTexture;

    if (canvas.getContext) {

        // Set the context variable so it can be re-used
        canvasContext = canvas.getContext('2d');

        // Create the particles and set their initial positions and velocities
        for(var i=0; i < particleCount; ++i){
          var particle = new Particle(canvasContext, canvasWidth, canvasHeight);
          
          // Set the position to be inside the canvas bounds
          particle.setPosition(this.generateRandom(0, canvasWidth), this.generateRandom(0, canvasHeight));
          
          // Set the initial velocity to be either random and either negative or positive
          particle.setVelocity(this.generateRandom(-maxVelocity, maxVelocity), this.generateRandom(-maxVelocity, maxVelocity));
          particles.push(particle);
        }
    }

    if (canvasContext) {
      setInterval(function() {
        if(self.state.time !== 'night'){
          return
        }
        // Update the scene befoe drawing
        self.update();

        // Draw the scene
        self.draw();
      }, 1000 / targetFPS);
    }

  }

  // A function to generate a random number between 2 values
  generateRandom(min, max){
    return Math.random() * (max - min) + min;
  }

  // The function to draw the scene
  draw() {
    // Clear the drawing surface
    canvasContext.clearRect(0, 0, 600, 500);
    // give it a transparent background
    canvasContext.fillStyle = "rgba(0, 0, 0, 0)";
    canvasContext.fillRect(0, 0, 600, 500);
    // Go through all of the particles and draw them.
    particles.forEach(function(particle) {
        particle.draw();
    });
  }

  // Update the scene
  update() {
    particles.forEach(function(particle) {
      particle.update();
    });
  }

  handleLobby(e, n, token) {
    const self  = this,
      socket    = io({transports: ['websocket'], upgrade: false})

    this.setState({ws: socket})

    if(token){
      let lobbyId = JSON.parse(token).lobbyId,
        userId    = JSON.parse(token).userId
      socket.emit('reconnectClient', {userId: userId, lobbyId: lobbyId})
    }

socket.on('joined', function(ioEvent){
      self.setState({lobbyId: ioEvent.lobbyId})
      let session = JSON.stringify({lobbyId: ioEvent.lobbyId, userId: ioEvent.userId})
      window.localStorage.setItem('witch-hunt', session);
    })

    // socket.on('audio', function(ioEvent){
    //   if(self.state.audioDisabled){
    //     return
    //   }
    //   self.state[ioEvent.fileName].play()
    // })

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

    socket.on('propegateMessage', function(ioEvent){
      let chat = self.state.messages.concat([ioEvent])
      self.setState({messages: chat})
      let messageListHeight      = document.querySelector('.message-list').offsetHeight,
        messageContainer         = document.querySelector('.message-container')
      messageContainer.scrollTop = messageListHeight - messageContainer.offsetHeight
    })

    socket.on('errorResponse', function(ioEvent){
      self.setState(ioEvent)
      setTimeout(function(){
        self.setState({error: null})
      }, 5000)
    })

    socket.on('badToken', function(){
      window.localStorage.removeItem('witch-hunt')
    })

    socket.on('setTimer', function(ioEvent){
      self.setState({timer: ioEvent.timer})
    })

  }

  toggleCreateLobby(event) {
    let newState = !this.state.create
    this.setState({create: newState})
  }

  handleNameChange(event) {
    let username = event.target.value.toLowerCase()    
    this.setState({username: username})
  }

  handleBotCount(event) {
    this.setState({botCount: event.target.value})
  }

  handleLobbyName(event) {
    let lobbyName = event.target.value.toLowerCase()
    this.setState({joinLobbyId: lobbyName})
  }

  leaveLobby() {
    // setting the leaveCurrentLobby var allows us to easilly have a confirmation message
    if(this.state.leaveCurrentLobby){
      this.setState({leaveCurrentLobby: false})
      window.localStorage.removeItem('witch-hunt')
      this.state.ws.emit('leaveLobby', {lobbyId: this.state.lobbyId})
      return
    }
    this.setState({leaveCurrentLobby: true})
  }

  skipVote() {
    this.state.ws.emit('submitVote', {skip: true, lobbyId: this.state.lobbyId, from: this.state.user.id})
  }

  stayHome() {
    this.state.ws.emit('watch', {skip: true, lobbyId: this.state.lobbyId, from: this.state.user.id})
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
      let lobby = this.state.joinLobbyId.toLowerCase();
      this.state.ws.emit('join', {username: this.state.username, lobbyId: lobby})
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
      settingClass = this.state.lobbyId ? this.state.lobbyId.split('-')[1] : ''

    let skippedPlayers = this.state.players.filter(function(player){
      return player.skip
    })

    let playerCardList = this.state.players.map(function(player, index){
      return <PlayerCard key={index} time={self.state.time} ready={self.state.started} winner={self.state.winner} ws={self.state.ws} lobbyId={self.state.lobbyId} player={player} watching={self.state.watching} marking={self.state.marking} user={self.state.user} />
    })

    let intro = <div className="columns">
      <div className="column">
        {this.state.started && this.state.time === 'day' &&
          <div>
            <a className="button is-primary" onClick={this.skipVote}>Skip</a>
          </div>
        }
        {this.state.started && this.state.time === 'night' &&
          <div>
            <a className="button is-primary" onClick={this.stayHome}>
              Stay Home
              {this.state.watching === 'skip' &&
                <img className="voted-mark" src={checkmark}/>
              }
            </a>
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
                  <input className="input" type="text" placeholder="Your Name" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" value={this.state.username} onChange={this.handleNameChange}/>
                  <input className="number" type="text" value={this.state.botCount} onChange={this.handleBotCount}/>
                </p>
              </div>
              {!this.state.create &&
                <div className="field">
                  <label className="label">Game Name</label>
                  <p className="control">
                    <input className="input" type="text" placeholder="Lobby Id" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" value={this.state.joinLobbyId} onChange={this.handleLobbyName}/>
                  </p>
                </div>
              }
              <div className="field">
                <p className="control">
                  <input className="button is-primary" type="submit" value={`${this.state.create ? "Create Game" : "Join"}`} onClick={this.handleLobby}/>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    let startText = !this.state.user.isCreator ? 'waiting for host to start' : this.state.players.length.toString() + ' villagers ready'

    return (
      <div id="app" className={`App container is-${this.state.time} ${settingClass} ${this.state.winner}`}>
        <canvas id="canvas" width={`${this.state.mistSettings.canvasWidth}`} height="500"></canvas>
        <div className='column main-column'>
          {this.state.playerNotification &&
            <div className={`player-notification ${this.state.notificationClass} ${this.state.showNotification ? 'show' : ''}`}>
              <div className='player-notification-text'>
                {this.state.playerNotification}
              </div>
            </div>
          }
          {this.state.error &&
            <div className="error fadeInDown">
              {this.state.error}
            </div>
          }
          <div className="top-nav">
            {this.state.timer > 0 &&
              <div className="timer">
                {this.state.timer}s
              </div>
            }
            {this.state.lobbyId &&
              <button className={`button leave-lobby is-${this.state.time}`} onClick={this.leaveLobby}>{this.state.leaveCurrentLobby ? 'Sure?' : 'Leave Game'}</button>
            }
            {this.state.lobbyId && !this.state.started &&
              <LobbyLink time={this.state.time} lobbyId={this.state.lobbyId}/>
            }
          </div>
          <div className="column">
            <GameIcon winner={this.state.winner} time={this.state.time} lobbyId={this.state.lobbyId}/>
            {!this.state.lobbyId &&
              <Intro />
            }
            {this.state.lobbyId && !this.state.started &&
              <div className="lobby-name">{this.state.lobbyId}</div>
            }
            {this.state.started === false && this.state.user.isCreator && this.state.players.length >= 4 && !this.state.winner &&
              <button className="button is-primary" onClick={this.readyUp}>Start Game</button>
            }
            {this.state.user.isCreator && this.state.players.length >= 4 && this.state.winner &&
              <button className="button is-primary" onClick={this.readyUp}>Play again</button>
            }
            <Instructions started={this.state.started} time={this.state.time} user={this.state.user} dayText={this.state.dayText} witchText={this.state.witchText} villagerText={this.state.villagerText}/>
            {this.state.lobbyId &&
              <MessageArea user={this.state.user} chat={this.state.messages} ws={this.state.ws} lobbyId={this.state.lobbyId}/>
            }
            {this.state.time === "trial" && this.state.onTrial.id !== this.state.user.id && !this.state.winner &&
              <TrialCard onTrial={this.state.onTrial} user={this.state.user} chat={this.state.messages} ws={this.state.ws} lobbyId={this.state.lobbyId}/>
            }
            {!this.state.started && this.state.lobbyId &&
              <h3>
                {this.state.players.length < 4 ? this.state.players.length.toString() + '/4 players ready' : startText}
              </h3>
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

export default App;
