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