import React, { Component } from 'react';
module.exports = class TrialCard extends Component {
  constructor(props) {
    super(props)
    this.yesVote = this.yesVote.bind(this)
    this.noVote  = this.noVote.bind(this)
  }

  yesVote(event) {
    this.props.ws.emit('trialVote', {vote: true, lobbyId: this.props.lobbyId, from: this.props.user.id})
  }
  noVote(event) {
    this.props.ws.emit('trialVote', {vote: false, lobbyId: this.props.lobbyId, from: this.props.user.id})
  }

  render() {
    const chatList = this.props.chat.map((chat) =>
      <li>{chat.from}: {chat.message}</li>
    )
    return (
      <div className="column fadeInUp">
        <div className="trial-user-name">
          {this.props.onTrial.username}
        </div>
        <div className="message-container">
          <ul className="message-list">{chatList}</ul>
        </div>
        <div className="button is-primary vote-btn" onClick={this.yesVote}>Guilty</div>
        <div className="button is-secondary vote-btn" onClick={this.noVote}>Innocent</div>
      </div>
    );
  }
}