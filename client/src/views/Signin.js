import '../views/Signin.css'
import { Button, TextField } from '@material-ui/core/'
import axios from "axios"
import { withRouter } from "react-router"

class Signin extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            nickname: '',
            password: ''
        }
    }
    signin = async () => {
      try {
        const response = await axios.post('/users/signin', { nickname: this.state.nickname, password: this.state.password });
        console.log('Returned data:', response);
        localStorage.setItem('token', response.data.token)
        this.props.history.push('/chat')
      } catch (e) {
        console.log(`Axios request failed: ${e}`);
      }
    }
    nicknameChange = (event) => {
        this.setState({nickname: event.target.value});
      }
    passwordChange = (event) => {
        this.setState({password: event.target.value});
      }
    render() {
        return (
            <div className="page_login">
                <div className="login_form">
                <TextField 
                  onChange={this.nicknameChange} 
                  label="nickname" 
                  variant="outlined" 
                  className="login_text_field" 
                  onKeyUp={event => event.key === 'Enter' ? this.signin(event) : null}/>
                <TextField 
                  onChange={this.passwordChange} 
                  label="password" 
                  type="password" 
                  variant="outlined" 
                  className="login_text_field"
                  onKeyUp={event => event.key === 'Enter' ? this.signin(event) : null}/>
                <Button onClick={this.signin} size="large" variant="outlined" color="primary">Sing in</Button>
                </div>
            </div>
        )
    }
}

export default withRouter(Signin);
