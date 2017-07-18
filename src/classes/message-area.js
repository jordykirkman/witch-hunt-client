import React, { Component } from 'react';
module.exports = class MessageArea extends Component {
  constructor(props) {
    super(props)
    this.sendMessage = this.sendMessage.bind(this),
    this.handleMessagleChange = this.handleMessagleChange.bind(this),
    this.state = {
      message: null
    }
  }

  sendMessage(e){
    e.preventDefault()
    if(!this.state.message){
      return
    }
    this.props.ws.emit('message', {lobbyId: this.props.lobbyId, message: this.state.message})
    this.setState({message: ''})
  }

  handleMessagleChange(event) {
    this.setState({message: event.target.value})
  }

  render() {
    const chatList = this.props.chat.map((message) =>
      <li>{message}</li>
    )
    return (
      <div className="column fadeInUp">
        <div className="message-container">
          <ul className="defense-message-list">{chatList}</ul>
        </div>
        <form onSubmit={this.sendMessage}>
          <input value={this.state.message} onChange={this.handleMessagleChange}/>
        </form>
      </div>
    );
  }
}