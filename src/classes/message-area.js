import React, { Component } from 'react';
module.exports = class MessageArea extends Component {
  constructor(props) {
    super(props)
    this.sendMessage = this.sendMessage.bind(this),
    this.handleMessageChange = this.handleMessageChange.bind(this),
    this.state = {
      message: ''
    }
  }

  componentDidMount() {
    let messageListHeight      = document.querySelector('.message-list').offsetHeight,
      messageContainer         = document.querySelector('.message-container')
    messageContainer.scrollTop = messageListHeight - messageContainer.offsetHeight
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
    const chatList = this.props.chat.map((message, index) =>
      <li key={index}><div className="chat-username">{message.username}</div><div className="chat-message">{message.message}</div></li>
    )
    return (
      <div className="column fadeInUp message-column">
        <div className="message-container">
          <ul className="message-list">{chatList}</ul>
        </div>
        <form onSubmit={this.sendMessage}>
          <input className="message-input" value={this.state.message} placeholder="address ye village" onChange={this.handleMessageChange}/>
        </form>
      </div>
    );
  }
}