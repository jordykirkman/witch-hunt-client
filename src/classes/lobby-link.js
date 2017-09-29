import React, { Component } from 'react';
module.exports = class TrialCard extends Component {
  constructor(props) {
    super(props)
    this.copyLink = this.copyLink.bind(this)
    this.state    = {
      buttonText: "Copy Link"
    }
  }

  copyLink(event) {
    var textarea            = document.createElement("textarea");
    textarea.textContent    = `${window.location.href}?lobby=${this.props.lobbyId}`;
    textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      let successful = document.execCommand("copy"),
        component    = this
      if(successful){
        this.setState({buttonText: "Copied!"})
        setTimeout(function(){
          component.setState({buttonText: "Copy Link"})
        }, 3000)
      }
    } catch (err) {
      console.log('Oops, unable to copy');
    }
  }

  render() {
    return (
      <button className={`button leave-lobby is-${this.props.time}`} onClick={this.copyLink}>
        {this.state.buttonText}
      </button>
    );
  }
}