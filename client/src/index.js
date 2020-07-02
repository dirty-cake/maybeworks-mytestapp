import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Chat from './views/Chat.js'
import io from 'socket.io-client'


ReactDOM.render(
  <React.StrictMode>
    <Chat />
  </React.StrictMode>,
  document.getElementById('root')
);


