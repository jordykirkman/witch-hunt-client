import React, { Component } from 'react';

module.exports = class Instructions extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      /*
        Something that really bothers ne is the need for element wrappers in JSX
        I cant just give the outer div a classname,
        bc each expression needs a wrapper div anyway >:(
        no matter what there is repetition. I wonder if there is a technique im missing
      */
      <div>
        {this.props.started && this.props.time === "night" && this.props.user.role === "villager" &&
          <div className="role-instructions">{this.props.villagerText}</div>
        }
        {this.props.started && this.props.time === "night" && this.props.user.role === "witch" &&
          <div className="role-instructions">{this.props.witchText}</div>
        }
        {this.props.started && this.props.time === "day" &&
          <div className="role-instructions">{this.props.dayText}</div>
        }
      </div>
    );
  }
}