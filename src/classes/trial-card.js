import React, { Component } from 'react';
module.exports = class TrialCard extends React.Component {
  constructor(props) {
    super(props)
    this.trialVote = this.trialVote.bind(this)
  }

  yesVote(event) {
    this.props.ws.emit('trialVote', {vote: true, lobbyId: this.props.lobbyId, from: this.props.user.id})
  }
  noVote(event) {
    this.props.ws.emit('trialVote', {vote: false, lobbyId: this.props.lobbyId, from: this.props.user.id})
  }

  render() {
    return (
      <div className="column fadeInUp">
        {this.props.onTrial.name}
        <div className="messages">
          {this.props.chat}
        </div>
        <div className="vote-btn" onClick={this.yesVote}>Guilty</div>
        <div className="vote-btn" onClick={this.noVote}>Innocent</div>
      </div>
    );
  }
}