import React, { Component } from 'react';
import sunLogo              from '../sun.svg';
import moonLogo             from '../moon.svg';
import introImage           from '../images/instructions.png';
module.exports = class Intro extends Component {
  constructor(props) {
    super(props)
  }

  render() {

    return (
      <div>
        <div className="lobby-name">
          Witch Hunt
          <img className="how-to-play-image" src={introImage} alt="Witch hunt how-to-play"/>
        </div>
        <div className="columns">
          <div className='column is-third'>
            <h4 className="title is-4">
              <img src={moonLogo} className="how-to-play-icon" alt="witch hunt night" />
              Night
            </h4>
            <ul className="instructions-list">
              <li>Villagers may visit one another to see if they are home or missing. 20% chance to fail.</li>
              <li>Monsters may choose a victim to "mark" for death. Monsters cannot mark eachother and are seen as missing.</li>
              <li>If a villager checks on someone else successfully, they are seen as missing.</li>
            </ul>
          </div>
          <div className='column is-third'>
            <h4 className="title is-4">
              <img src={sunLogo} className="how-to-play-icon" alt="witch hunt day" />
              Day
            </h4>
            <ul className="instructions-list">
              <li>The village may vote to put someone on trial (anonymously).</li>
              <li>When on trial, a villager may defend themselves, point blame. The others vote to spare or kill.</li>
            </ul>
          </div>
          <div className='column is-third'>
            <h4 className="title is-4">
              To Win
            </h4>
            <ul className="instructions-list">
              <li>Villagers must kill the hiding monsters.</li>
              <li>If living monsters are equal to unmarked/unkilled villagers, marked villagers die and monsters win.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}