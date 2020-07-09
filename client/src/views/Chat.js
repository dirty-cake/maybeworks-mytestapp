import React from 'react';
import io from 'socket.io-client'
import jwt from 'jsonwebtoken'
import Message from '../components/Message' 
import { withRouter } from 'react-router'
import { Button, TextField, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Avatar } from '@material-ui/core'
import { Person as PersonIcon } from '@material-ui/icons'
import axios from 'axios'


import './Chat.css'

class Chat extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            text: '',
            messages: [],
            users: {},
            user: { nickname: '', is_muted: false, color: '' },
            is_waiting: false
        }
    }
    componentDidMount() {
        this.setState({
            user: jwt.decode(localStorage.getItem('token'))
        })
        this.fetchUsers()
        this.socket = io('http://localhost:8080', {
            path: '/socket',
            query: {
                token: localStorage.getItem('token')
            }
        })
        this.socket.on('new message', this.addMessage)
        this.socket.on('user connected', user => {
            console.log((user))
            this.setState(state => ({
                users: {...state.users, [user.id]: user}
            }))
        })
        this.socket.on('user disconnected', user => {
            this.setState(state => {
                const users = {...state.users }
                delete users[user.id]
                return {users: users}
            })
        })
        this.socket.on('mute user', user => {
            if (this.state.user.id === user.id) {
                this.setState(state => ({
                    user: {...state.user, is_muted: true}
                }))
            } else {
                this.setState(state => ({
                   users: {...state.users, [user.id]: {...state.users[user.id], is_muted: true}}
                }))
            }
        })
        this.socket.on('ban user', user => {
            console.log(user)
            if (this.state.user.id === user.id) {
                this.signout()
            }
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
    fetchUsers = async () => {
        try {
            const response = await axios.get('/users', {
                headers: {
                    authorization: localStorage.getItem('token')
                }
            });
            console.log('Returned data:', response);
            this.setState(state => ({
                users: {...state.users, ...response.data.reduce((users, user) => {
                    users[user.id] = user
                    return users
                }, {})}
            }))
        } catch (e) {
            console.log(`Axios request failed: ${e}`);
        }
    }
    sendMessage = () => {
        if (this.state.text.length > 200) {
            return console.log('You can not put more than 200 elements')
        } else if (this.state.text === '') {
            return console.log('You can not send empty message')
        } else if (this.state.user.is_muted) {
            return console.log('You are muted. You can not send messages')
        } else if (this.state.is_waiting) {
            return console.log('You can not send a message. Wait 15 seconds')
        }
        this.socket.emit('new message', {text: this.state.text})
        this.setState({is_waiting: true})
        setTimeout(() => this.setState({is_waiting: false}), 15000)
        this.addMessage({nickname: this.state.user.nickname, time: Date.now(), text: this.state.text, color: this.state.user.color})
        this.setState({text: ''})
    }
    signout = () => {
        localStorage.removeItem('token')
        this.socket.disconnect()
        this.props.history.push('/')
    }
    mute = (userId) => {
        this.socket.emit('mute user', {id: userId})
        console.log(userId, 'is muted')
    }
    ban = (userId) => {
        this.socket.emit('ban user', {id: userId})
        console.log(userId, 'is banned')
    }
    render() {
        return (
            <div className="chat_page">
                <div className="first_chat_page">
                    <List dense>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar style={{backgroundColor: '#' + this.state.user.color.toString(16)}}>
                                    <PersonIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={this.state.user.nickname} />
                            <ListItemSecondaryAction>
                                <Button onClick={this.signout} size="large" variant="outlined" color="primary" > Sign out</Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                        {Object.values(this.state.users).map(user => (
                            <ListItem key={user.id}>
                                <ListItemAvatar>
                                    <Avatar style={{backgroundColor: '#' + user.color.toString(16)}}>
                                        <PersonIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={user.nickname} />
                                {
                                    this.state.user.is_admin 
                                        ? (
                                        <ListItemSecondaryAction >
                                            <Button onClick={() => {this.mute(user.id)}} size="small" variant="outlined" color="primary" > Mute</Button>
                                            <Button onClick={() => {this.ban(user.id)}} size="small" variant="outlined" color="primary" > Ban</Button>
                                        </ListItemSecondaryAction>
                                        )
                                        : null 
                                }
                            </ListItem>
                        ))}
                    </List>
                    <div className="users">
                    </div>
                    <div className="signout_button">
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
                        <Button 
                            onClick={this.sendMessage} 
                            size="large" 
                            variant="outlined" 
                            color="primary" 
                            className="send_button" 
                            disabled={this.state.text.length > 200 || this.state.text.length < 1 || this.state.is_waiting || Boolean(this.state.user.is_muted)}
                        > 
                            Send
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Chat);