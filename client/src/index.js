import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Signin from './views/Signin.js'
// import io from 'socket.io-client'


ReactDOM.render(
  <React.StrictMode>
    <Signin />
  </React.StrictMode>,
  document.getElementById('root')
);


