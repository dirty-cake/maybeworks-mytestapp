import React from 'react';
import './User.css'

class User extends React.Component {
    
    render() {
      return (
        <div className="user">
            <div className="user_line">
                <div className="nickname">{ this.props.nickname }</div>
                <div className="online_offline">{ this.props.state } </div>
                <div className="mute_unmute">{ this.props.mute }</div>
            </div>
        </div>
      )
    }
  }

  export default User;