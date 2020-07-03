import React from 'react';
import Message from '../components/Message' 
import { Button, TextField } from '@material-ui/core/';
import './Chat.css'
import io from 'socket.io-client'

class Chat extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            text: '',
            messages: []
        }
    }
    componentDidMount() {
        this.socket = io('http://localhost:8080', {
            path: '/socket'
        })
        this.socket.on('new message', message => {
            this.setState(state => ({
                messages: [...state.messages, message]
            }))
        })
    }
    changeText = (event) => {
        this.setState({text: event.target.value});
    }
    sendMessage = () => {
        this.socket.emit('new message', {author: 'irka', time: Date.now(), text: this.state.text})
        this.setState({text: ''})
    }
    render() {
        return (
            <div className="chat_page">
                <div className="message_list">
                    {this.state.messages.map(message => <Message {...message}/>)}
                </div>
                <div className="message_send">
                    <div className="message_textfield">
                        <TextField onChange={this.changeText} value={this.state.text} label="Write a message" variant="outlined" fullWidth/>
                    </div>
                    <Button onClick={this.sendMessage} size="large" variant="outlined" color="primary" className="send_button"> Send</Button>
                </div>
            </div>
        )
    }
}

export default Chat;
