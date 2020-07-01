import React from 'react';
import Message from '../components/Message' 
import { Button, TextField } from '@material-ui/core/';
import '../views/Chat.css'


class Chat extends React.Component {
    render() {
        return (
            <div className="chat_page">
                <div className="message_list">
                    <Message author="irina" time="12:00" text="Hi,how are you?"></Message>
                    <Message author="darina" time="12:05" text="good, you?"></Message>
                    <Message author="irina" time="12:07" text="what are you doing?"></Message>
                    <Message author="darina" time="12:08" text="doing my test and you?"></Message>
                </div>
                <div className="message_send">
                    <div className="message_textfield"><TextField label="Write a message" variant="outlined"/></div>
                    <Button size="large" variant="outlined" color="primary" className="send_button"> Send</Button>
                </div>
            </div>
        )
    }
}

export default Chat;
