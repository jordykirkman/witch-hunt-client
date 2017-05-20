import React, { Component } from 'react';
module.exports = class PlayerCard extends React.Component {
  constructor(props) {
    super(props)
    this.handleVote = this.handleVote.bind(this)
  }

  handleVote(event) {
    let self = this
    // do nothing if the game hasnt started yet of you are dead
    if(!this.props.ready || this.props.player.isDead){
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
      <div className="column is-half-mobile is-one-third-tablet is-one-third-desktop fadeInUp" onClick={this.handleVote}>
        <div className={`notification info-card ${myCardClass} info-card-${this.props.player.role} ${myDeadClass} is-${this.props.time}`}>
          <div className="title">{myCard ? '(you)' : ''}{this.props.player.username}</div>
          <div className="subtitle">
            <div className="player-role">
              {this.props.player.isDead ? this.props.player.role : `${myCard ? this.props.player.role : '???'}`}
            </div>
            <div className="vote-count">
              {this.props.player.isDead ? 'Killed' : this.props.player.killVote.length.toString()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}