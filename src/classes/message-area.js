import React, { Component } from 'react';
module.exports = class MessageArea extends Component {
  constructor(props) {
    super(props)
    this.sendMessage = this.sendMessage.bind(this),
    this.handleMessageChange = this.handleMessageChange.bind(this),
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

  handleMessageChange(event) {
    this.setState({message: event.target.value})
  }

  render() {
    const chatList = this.props.chat.map((chat) =>
      <li>{chat.from}: {chat.message}</li>
    )
    return (
      <div className="column fadeInUp">
        <div className="message-container">
          <ul className="message-list">{chatList}</ul>
        </div>
        <form onSubmit={this.sendMessage}>
          <input value={this.state.message} onChange={this.handleMessageChange}/>
        </form>
      </div>
    );
  }
}