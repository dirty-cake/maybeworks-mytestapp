import React from 'react';
import Message from '../components/Message' 
import User from '../components/User' 
import { withRouter } from "react-router"
import { Button, TextField } from '@material-ui/core/'
import './Chat.css'
import io from 'socket.io-client'



class Chat extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            text: '',
            messages: [],
            users: []
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
        if (this.state.text.length >= 300) {
            console.log('You can not put more than 300 elements')
        } else if(this.state.text !== '') {
            this.socket.emit('new message', {author: 'irka', time: Date.now(), text: this.state.text})
            this.setState(state => ({
                messages: [...state.messages, {author: 'irka', time: Date.now(), text: this.state.text}]
            }))
            this.setState({text: ''})
        }
    }
    onKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.sendMessage()
        }}

    signout = () => {
        localStorage.removeItem('token')
        this.props.history.push('/')
    }
    render() {
        return (
            <div className="chat_page">
                <div className="first_chat_page">
                    <div className="users">
                        <User nickname="Irka" state="online"/>
                        <User nickname="Dima" state="online"/>
                        <User nickname="Masha" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                        <User nickname="Luda" state="online"/>
                    </div>
                    <div className="signout_button">
                        <Button onClick={this.signout} size="large" variant="outlined" color="primary" > Sign out</Button>
                    </div>
                </div>
                <div className="second_chat_page">
                    <div className="message_list">
                        {this.state.messages.map(message => <Message {...message}/>)}
                    </div>
                    <div className="message_send">
                        <div className="message_textfield">
                            <TextField  
                            onKeyUp={(event) => this.onKeyPress(event)} 
                            onChange={this.changeText} value={this.state.text} label="Write a message" variant="outlined" fullWidth/>
                        </div>
                        <Button onClick={this.sendMessage} size="large" variant="outlined" color="primary" className="send_button"> Send</Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Chat);