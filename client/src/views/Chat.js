import React from 'react';
import io from 'socket.io-client'
import Message from '../components/Message' 
import { withRouter } from 'react-router'
import { IconButton, TextField, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Avatar, Badge, Drawer, Hidden } from '@material-ui/core'
import PersonIcon from '@material-ui/icons/Person'
import MenuIcon from '@material-ui/icons/Menu'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import BlockIcon from '@material-ui/icons/Block'
import SendIcon from '@material-ui/icons/Send'
import MicOffIcon from '@material-ui/icons/MicOff'
import MicIcon from '@material-ui/icons/Mic'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'

import './Chat.css'

class Chat extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mobileOpen: false,
            text: '',
            messages: [],
            users: {},
            user: { nickname: '', is_muted: false, color: '' },
            is_waiting: false
        }
    }
    componentDidMount() {
        this.socket = io('http://localhost:8080', {
            path: '/socket',
            query: {
                token: localStorage.getItem('token')
            }
        })

        this.socket.on('user data', user => {
            this.setState({user})
        })

        this.socket.on('all users', users => {
            this.setState(state => ({
                users: {...state.users, ...users.reduce((users, user) => {
                    users[user.id] = user
                    return users
                }, {})}
            }))
        })

        this.socket.on('user connected', user => {
            this.setState(state => ({
                users: {...state.users, [user.id]: user}
            }))
        })

        this.socket.on('user disconnected', user => {
            if (!this.state.user.is_admin) {
                this.setState(state => {
                    const users = {...state.users }
                    delete users[user.id]
                    return {users: users}
                })
            } else {
                this.setState(state => ({
                    users: {...state.users, [user.id]: {...state.users[user.id], is_online: false}}
                 }))
            }
        })

        this.socket.on('new message', this.addMessage)

        this.socket.on('mute user', user => {
            if (this.state.user.id === user.id) {
                this.setState(state => ({
                    user: {...state.user, is_muted: true}
                }))
            } else if (this.state.users[user.id]) {
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
            } else if (this.state.users[user.id]) {
                this.setState(state => ({
                   users: {...state.users, [user.id]: {...state.users[user.id], is_muted: false}}
                }))
            }
        })

        this.socket.on('ban user', user => {
            if (this.state.user.id === user.id) {
                this.signout()
            } else if (this.state.users[user.id]) {
                this.setState(state => ({
                    users: {...state.users, [user.id]: {...state.users[user.id], is_banned: true}}
                }))
            }
        })

        this.socket.on('unban user', user => {
            if (this.state.users[user.id]) {
                this.setState(state => ({
                    users: {...state.users, [user.id]: {...state.users[user.id], is_banned: false}}
                }))
            }
        })
    }
    addMessage = (message) => {
        this.setState(
            state => ({ messages: [...state.messages, message]}),
            () => this.refScroll.scroll({ top: this.refScroll.scrollHeight })
        )
    }
    changeText = (event) => {
        this.setState({text: event.target.value});
    }
    handleDrawerToggle = () => {
        this.setState(state => ({ mobileOpen: !state.mobileOpen }))
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
    signout = () => {
        localStorage.removeItem('token')
        this.socket.disconnect()
        this.props.history.push('/')
    }
    renderList = () => {
        return (
            <List dense>
                <ListItem>
                    <ListItemAvatar>
                        <Badge color="primary" overlap="circle" variant="dot" anchorOrigin={{vertical: 'bottom', horizontal: 'right' }}>
                            <Avatar style={{backgroundColor: '#' + this.state.user.color.toString(16)}}>
                                {this.state.user.is_muted ? <MicOffIcon /> : <PersonIcon />}
                            </Avatar>
                        </Badge>
                    </ListItemAvatar>
                    <ListItemText primary={this.state.user.nickname} />
                    <ListItemSecondaryAction>
                        <IconButton onClick={this.signout} color="primary" aria-label="Sign out" >
                            <ExitToAppIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
                {Object.values(this.state.users).sort((a, b) => a.is_online > b.is_online ? -1 : 1).map(user => (
                    <ListItem classes={{secondaryAction: 'chat_user_item'}} key={user.id}>
                        <ListItemAvatar>
                            <Badge color="primary" overlap="circle" variant="dot" invisible={!user.is_online} anchorOrigin={{vertical: 'bottom', horizontal: 'right' }}>
                                <Avatar style={{backgroundColor: '#' + user.color.toString(16)}}>
                                    {
                                        user.is_muted ? <MicOffIcon />
                                        : user.is_banned ? <BlockIcon />
                                        : <PersonIcon />
                                    } 
                                </Avatar>
                            </Badge>
                        </ListItemAvatar>
                        <ListItemText classes={{primary: 'chat_nickname'}} primary={user.nickname} />
                        {
                            this.state.user.is_admin 
                                ? (
                                    <ListItemSecondaryAction>
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
        )
    }
    render() {
        return (
            <div className="chat_page">
                <div className="first_chat_page">
                    <Hidden mdUp implementation="js">
                        <Drawer
                            className="chat_drawer"
                            variant="temporary"
                            open={this.state.mobileOpen}
                            onClose={this.handleDrawerToggle}
                        >
                            {this.renderList()}
                        </Drawer>
                    </Hidden>
                    <Hidden smDown implementation="js">
                        <Drawer className="chat_drawer" variant="permanent" open>
                            {this.renderList()}
                        </Drawer>
                    </Hidden>
                </div>
                <div className="second_chat_page">
                    <div className="messages_container" ref={ref => this.refScroll = ref}>
                        <div className="messages_list">
                            {this.state.messages.map((message, index) => <Message {...message} key={index}/>)}
                        </div>
                    </div>
                    <div className="message_send">
                        <Hidden mdUp implementation="js">
                            <IconButton 
                                onClick={this.handleDrawerToggle} 
                                color="primary" 
                                className="send_button" 
                                aria-label="send"
                            > 
                                <MenuIcon />
                            </IconButton>
                        </Hidden>
                        <div className="message_textfield">
                            <TextField
                                value={this.state.text}
                                onKeyUp={event => event.key === 'Enter' ? this.sendMessage(event) : null} 
                                onChange={this.changeText}
                                label="Write a message"
                                variant="outlined"
                                fullWidth
                            />
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