import React, { Component } from 'react';
module.exports = class TrialCard extends Component {
  constructor(props) {
    super(props)
    this.yesVote = this.yesVote.bind(this)
    this.noVote  = this.noVote.bind(this)
  }

  yesVote(event) {
    this.props.ws.emit('trialVote', {vote: 'yes', lobbyId: this.props.lobbyId, from: this.props.user.id})
  }
  noVote(event) {
    this.props.ws.emit('trialVote', {vote: 'no', lobbyId: this.props.lobbyId, from: this.props.user.id})
  }

  render() {
    return (
      <div className="column fadeInUp">
        <div className="trial-user-name">
          {this.props.onTrial.username}
        </div>
        <div className="button is-primary vote-btn" onClick={this.yesVote}>Guilty</div>
        <div className="button is-secondary vote-btn" onClick={this.noVote}>Innocent</div>
      </div>
    );
  }
}