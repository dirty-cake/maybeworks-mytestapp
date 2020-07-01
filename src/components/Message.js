import React from 'react';
import '../components/Message.css'

class Message extends React.Component {
    
    render() {
      return (
        <div className="message">
            <div className="message_first_line">
                <div className="message_author">{ this.props.author }</div>
                <div className="message_time">{ this.props.time } </div>
            </div>
            <div className="message_text">{ this.props.text }</div>
        </div>
      )
    }
  }

  export default Message;