import React from 'react';
import Message from '../components/Message' 
import { Button, TextField } from '@material-ui/core/';
import './Chat.css'

const messages = [
    { author: 'irina', time: '12:00', text: 'hi, how are you?' },
    { author: 'irina', time: '12:00', text: 'hi, how are you?' },
    { author: 'irina', time: '12:00', text: 'hi, how are you?' },
    { author: 'irina', time: '12:00', text: 'hi, how are you?' },
    { author: 'irina', time: '12:00', text: 'hi, how are you?' }
]

class Chat extends React.Component {
    render() {
        return (
            <div className="chat_page">
                <div className="message_list">
                    {messages.map(message => <Message {...message}/>)}
                </div>
                <div className="message_send">
                    <div className="message_textfield"><TextField label="Write a message" variant="outlined" fullWidth/></div>
                    <Button size="large" variant="outlined" color="primary" className="send_button"> Send</Button>
                </div>
            </div>
        )
    }
}

export default Chat;
