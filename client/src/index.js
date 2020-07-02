import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Signin from './views/Signin.js'
import io from 'socket.io-client'

const socket = io('http://localhost:8080', {
  path: '/socket'
})

socket.on('new message', message => {
console.log(message)
})

socket.emit('new message', {author: 'irka', time: Date.now(), text: 'Bye'})

 ReactDOM.render(
  <React.StrictMode>
    <Signin />
  </React.StrictMode>,
  document.getElementById('root')
);


