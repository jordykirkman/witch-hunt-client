import React, { Component } from 'react';
import checkmark            from '../images/checkmark.svg';
import eye                  from '../images/eye.svg';
import pentagram              from '../images/pentagram.svg';
module.exports = class PlayerCard extends React.Component {
  constructor(props) {
    super(props)
    this.handleVote = this.handleVote.bind(this)
  }

  handleVote(event) {
    // do nothing if the game hasnt started yet of you are dead
    if(!this.props.ready || this.props.player.isDead){
      return
    }
    if(this.props.player.id === this.props.user.id){
      return
    }
    // send a kill if it's night and you are a monster
    if(this.props.time === 'night' && this.props.player.id !== this.props.user.id && this.props.user.role === 'witch'){
      this.props.ws.emit('kill', {user: this.props.player.id, lobbyId: this.props.lobbyId, from: this.props.from})
      return
    }
    // reveal a role if it's dawn and you are a prophet
    if(this.props.time === 'night' && this.props.player.id !== this.props.user.id && this.props.user.role === 'villager'){
      this.props.ws.emit('watch', {user: this.props.player.id, lobbyId: this.props.lobbyId})
    }
    // send a kill/unkill vote if it's day
    if(this.props.time === 'day'){
      this.props.ws.emit('submitVote', {user: this.props.player.id, lobbyId: this.props.lobbyId, from: this.props.user.id})
    }
  }

  render() {
    let myCard      = this.props.player.id === this.props.user.id,
      myCardClass   = myCard ? 'is-me' : '',
      myMarkedClass = this.props.player.isMarked ? 'is-marked' : '',
      witches       = this.props.player.role === "witch" && this.props.user.role === "witch",
      myDeadClass   = this.props.player.isDead ? 'is-dead' : 'is-alive'

    let voted       = this.props.player.voteFor || this.props.player.trialVote ? <img className="voted-mark" src={checkmark}/> : '',
      watching      = this.props.watching === this.props.player.id ? <img className="watching-mark" src={eye}/> : '',
      marking       = this.props.marking === this.props.player.id ? <img className="marking-mark" src={pentagram}/> : '',
      fontSize      = '1rem'

    if(this.props.player.username){
      fontSize      = this.props.player.username.length < 10 ? '1rem' : `${220 / this.props.player.username.length}px`
    }

    return (
      <div className="player-card column is-half-mobile is-one-third-tablet is-one-third-desktop fadeInUp" onClick={this.handleVote}>
        <div className="marks-section">
          {voted}
          {watching}
          {marking}
        </div>
        <div className={`notification info-card ${myCardClass} info-card-${this.props.player.role} ${myDeadClass} ${myMarkedClass} is-${this.props.time}`}>
          <div className="title" style={{fontSize: fontSize}}>{myCard ? '(you)' : ''}{this.props.player.username}</div>
          <div className="subtitle">
            <div className="player-role">
              {this.props.player.isDead || this.props.winner ? this.props.player.role : `${myCard || witches ? this.props.player.role : '???'}`}
            </div>
          </div>
        </div>
      </div>
    );
  }
}