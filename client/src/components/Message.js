import React from 'react';
import './Message.css'
import { DateTime } from 'luxon' 

class Message extends React.Component {
    
    render() {
      return (
        <div className="message" style={{backgroundColor: '#' + this.props.color.toString(16)}}>
            <div className="message_first_line">
                <div className="message_author">{ this.props.nickname }</div>
                <div className="message_time">{ DateTime.fromMillis(this.props.time).toLocaleString(DateTime.DATETIME_SHORT) } </div>
            </div>
            <div className="message_text">{ this.props.text }</div>
        </div>
      )
    }
  }

  export default Message;