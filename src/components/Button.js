import React from 'react'

class Button extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            name: 'ok'
        }
    }

    render() {
        const {text, onClick} = this.props
        return (
        <button onClick = {onClick}>{text}</button>
        )
    }
}

export default Button