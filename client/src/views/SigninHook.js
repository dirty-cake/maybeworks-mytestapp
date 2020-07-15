import React, { useState, useRef } from 'react'
import '../views/Signin.css'
import { Button, TextField } from '@material-ui/core/'
import axios from "axios"
import { withRouter } from "react-router"
import Modal from "../components/Modal"

const SigninHook = (props) => {
    const modalRef = useRef()
    const [input, setInput] = useState({})

    const signin = async () => {
        try {
            if(input.nickname && input.password) {
                const response = await axios.post('/users/signin', { nickname: input.nickname, password: input.password });
                localStorage.setItem('token', response.data.token)
                props.history.push('/chat')
            }
        } catch (e) {
          console.log(`Axios request failed: ${e}`);
          modalRef.current.openModal()
        }
    }
    const inputChange = (event) => {
        setInput({...input, [event.target.name]: event.target.value})
    }
    const onKeyUp = (event) => {
        event.key === 'Enter' && signin()   
    }

    return (
        <div className="page_login">
            <div className="login_form">
                <TextField 
                  onChange={inputChange} 
                  name="nickname"
                  label="nickname" 
                  variant="outlined" 
                  className="login_text_field" 
                  onKeyUp={onKeyUp} />
                <TextField 
                  onChange={inputChange} 
                  name="password"
                  label="password" 
                  type="password" 
                  variant="outlined" 
                  className="login_text_field"
                  onKeyUp={onKeyUp}/>
                <Button onClick={signin} size="large" variant="outlined" color="primary">Sing in</Button>
            </div>
            <Modal ref={modalRef}>
                <h1>Check your nickname and password</h1>
                <button onClick={modalRef.current?.close}> Close Modal </button>
            </Modal>
        </div>
    )
}

export default withRouter(SigninHook)