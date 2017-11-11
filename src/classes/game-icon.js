import React, { Component } from 'react';
import sunLogo              from '../sun.svg';
import moonLogo             from '../moon.svg';
import witchesLogo          from '../witches.svg';
import villagersLogo        from '../villagers.svg';
module.exports = class GameIcon extends Component {
  constructor(props) {
    super(props)
  }

  render() {

    let gameIcon  = witchesLogo,
      timeIcon    = null
    if(this.props.winner === 'villagers'){
      gameIcon = villagersLogo
    }
    if(this.props.time === 'day'){
      timeIcon = sunLogo
    }
    if(this.props.time === 'night'){
      timeIcon = moonLogo
    }

    return (
      <div>
        {this.props.winner &&
          <div className="game-state-icon">
            <img src={gameIcon} className="App-logo winner" alt={`${this.props.time}`} />
            <h2>{this.props.winner}</h2>
          </div>
        }
        {!this.props.winner && this.props.lobbyId &&
          <div className="game-state-icon">
            <img src={timeIcon} className="App-logo time-icon" alt={`${this.props.time}`} />
          </div>
        }
      </div>
    );
  }
}