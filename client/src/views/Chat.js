import React from 'react';
import io from 'socket.io-client'
import jwt from 'jsonwebtoken'
import Message from '../components/Message' 
import { withRouter } from 'react-router'
import { IconButton, TextField, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Avatar } from '@material-ui/core'
import { Person as PersonIcon } from '@material-ui/icons'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import BlockIcon from '@material-ui/icons/Block'
import SendIcon from '@material-ui/icons/Send'
import MicOffIcon from '@material-ui/icons/MicOff'
import MicIcon from '@material-ui/icons/Mic'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
// import axios from 'axios'


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
        this.socket.on('all users', users => {
            this.setState(state => ({
                users: {...state.users, ...users.reduce((users, user) => {
                    users[user.id] = user
                    return users
                }, {})}
            }))
        })
        this.socket.on('user disconnected', user => {
            if (!this.state.user.is_admin) {
                this.setState(state => {
                    const users = {...state.users }
                    delete users[user.id]
                    return {users: users}
                })
            }
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
        this.socket.on('unmute user', user => {
            if (this.state.user.id === user.id) {
                this.setState(state => ({
                    user: {...state.user, is_muted: false}
                }))
            } else {
                this.setState(state => ({
                   users: {...state.users, [user.id]: {...state.users[user.id], is_muted: false}}
                }))
            }
        })
        this.socket.on('ban user', user => {
            console.log(user)
            if (this.state.user.id === user.id) {
                this.signout()
            } else {
                this.setState(state => ({
                    users: {...state.users, [user.id]: {...state.users[user.id], is_banned: true}}
                }))
            }
        })
        this.socket.on('unban user', user => {
            console.log(user)
            this.setState(state => ({
                users: {...state.users, [user.id]: {...state.users[user.id], is_banned: false}}
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
    /* fetchUsers = async () => {
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
    } */
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
    unmute = (userId) => {
        this.socket.emit('unmute user', {id: userId})
        console.log(userId, 'is unmuted')
    }
    ban = (userId) => {
        this.socket.emit('ban user', {id: userId})
        console.log(userId, 'is banned')
    }
    unban = (userId) => {
        this.socket.emit('unban user', {id: userId})
        console.log(userId, 'is unbanned')
    }
    render() {
        return (
            <div className="chat_page">
                <div className="first_chat_page">
                    <List dense>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar style={{backgroundColor: '#' + this.state.user.color.toString(16)}}>
                                    {
                                        this.state.user.is_muted
                                        ? (
                                            <MicOffIcon /> 
                                        ) : (
                                            <PersonIcon />
                                        )
                                    }
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={this.state.user.nickname} />
                            <ListItemSecondaryAction>
                                <IconButton onClick={this.signout} color="primary" aria-label="Sign out" >
                                    <ExitToAppIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                        {Object.values(this.state.users).map(user => (
                            <ListItem key={user.id}>
                                <ListItemAvatar>
                                    <Avatar style={{backgroundColor: '#' + user.color.toString(16)}}>
                                        {
                                            user.is_muted
                                            ? (
                                                <MicOffIcon />
                                            ) : user.is_banned 
                                            ? (
                                                <BlockIcon />
                                            ) : (
                                                <PersonIcon />
                                            )
                                        } 
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={user.nickname} />
                                {
                                    this.state.user.is_admin 
                                        ? (
                                        <ListItemSecondaryAction >
                                            {
                                                user.is_muted
                                                ? (
                                                <IconButton onClick={() => {this.unmute(user.id)}} color="primary" aria-label="unmute"> 
                                                    <MicIcon />
                                                </IconButton>
                                                ) : (
                                                <IconButton onClick={() => {this.mute(user.id)}} color="secondary" aria-label="mute"> 
                                                    <MicOffIcon />
                                                </IconButton>
                                                )
                                            }

                                            {
                                                user.is_banned
                                                ? (
                                                <IconButton onClick={() => {this.unban(user.id)}} color="primary" aria-label="unban">
                                                    <AddCircleOutlineIcon />
                                                </IconButton> 
                                                ) : (
                                                <IconButton onClick={() => {this.ban(user.id)}} color="secondary" aria-label="ban">
                                                    <BlockIcon />
                                                </IconButton>
                                                )
                                            }
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
                        <IconButton 
                            onClick={this.sendMessage} 
                            color="primary" 
                            className="send_button" 
                            aria-label="send"
                            disabled={this.state.text.length > 200 || this.state.text.length < 1 || this.state.is_waiting || Boolean(this.state.user.is_muted)}
                        > 
                            <SendIcon />
                        </IconButton>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Chat);