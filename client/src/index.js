import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Chat from './views/Chat.js'
import Signin from './views/Signin.js'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom"


 ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/chat" render={() => localStorage.getItem('token') ? <Chat /> : <Redirect to="/" />}>
        </Route>
        <Route path="/" render={() => !localStorage.getItem('token') ? <Signin /> : <Redirect to="/chat" />}>
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);


