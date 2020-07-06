import React from 'react';
import Message from '../components/Message' 
import User from '../components/User' 
import { withRouter } from "react-router"
import { Button, TextField } from '@material-ui/core/'
import './Chat.css'
import io from 'socket.io-client'
import jwt from 'jsonwebtoken'


class Chat extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            text: '',
            messages: [],
            users: [],
            user: { nickname: '' }
        }
    }
    componentDidMount() {
        this.setState({
            user: jwt.decode(localStorage.getItem('token'))
        })
        this.socket = io('http://localhost:8080', {
            path: '/socket',
            query: {
                token: localStorage.getItem('token')
            }
        })
        this.socket.on('new message', this.addMessage)
        this.socket.on('user connected', user => {
            this.setState(state => ({
                users: [...state.users, user]
            }))
        })
        this.socket.on('user disconnected', user => {
            this.setState(state => ({
                users: state.users.filter((element) => {
                    return element.nickname !== user.nickname
                })
            }))
        })
    }
    addMessage = (message) => {
        this.setState(state => ({
            messages: [...state.messages, message]
        }), () => {
            this.refScroll.scroll({
                top: this.refScroll.scrollHeight
            })
        })
    }
    changeText = (event) => {
        this.setState({text: event.target.value});
    }
    sendMessage = () => {
        if (this.state.text.length > 200) {
            return console.log('You can not put more than 200 elements')
        } else if (this.state.text === '') {
            return console.log('You can not send empty message')
        }
        this.socket.emit('new message', {text: this.state.text, token: localStorage.getItem('token')})
        this.addMessage({nickname: this.state.user.nickname, time: Date.now(), text: this.state.text})
        this.setState({text: ''})
    }
    signout = () => {
        localStorage.removeItem('token')
        this.socket.disconnect()
        this.props.history.push('/')
    }
    render() {
        return (
            <div className="chat_page">
                <div className="first_chat_page">
                    <div className="users">
                        {this.state.users.map(user => <User {...user}/>)}
                    </div>
                    <div className="signout_button">
                        <Button onClick={this.signout} size="large" variant="outlined" color="primary" > Sign out</Button>
                    </div>
                </div>
                <div className="second_chat_page">
                    <div className="messages_container" ref={ref => this.refScroll = ref}>
                        <div className="messages_list">
                            {this.state.messages.map((message, index) => <Message {...message} key={index}/>)}
                        </div>
                    </div>
                    <div className="message_send">
                        <div className="message_textfield">
                            <TextField
                            onKeyUp={event => event.key === 'Enter' ? this.sendMessage(event) : null} 
                            onChange={this.changeText} value={this.state.text} label="Write a message" variant="outlined" fullWidth/>
                        </div>
                        <Button onClick={this.sendMessage} size="large" variant="outlined" color="primary" className="send_button" disabled={this.state.text.length > 200}> Send</Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Chat);