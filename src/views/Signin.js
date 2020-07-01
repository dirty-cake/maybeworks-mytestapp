import React from 'react';
import '../views/Signin.css';
import { Button, TextField } from '@material-ui/core/';

class Signin extends React.Component {
    render() {
        return (
            <div className="page_login">
                <div className="login_form">
                <TextField label="nickname" variant="outlined" className="login_text_field"/>
                <TextField label="password" variant="outlined" className="login_text_field"/>
                <Button size="large" variant="outlined" color="primary">Sing in</Button>
                </div>
            </div>
        )
    }
}

export default Signin;
