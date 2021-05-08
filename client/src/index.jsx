import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router'
import { createBrowserHistory } from 'history'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import { UserIsAuthenticated, UserIsNotAuthenticated } from './util/wrappers.js'
import getWeb3 from './util/web3/getWeb3'

// Layouts
import App from './App'
import Home from './layouts/home/Home'
import Canvas from './layouts/canvas/CanvasPage'
// Redux Store
import store from './store'

// Initialize react-router-redux.
const history = syncHistoryWithStore(createBrowserHistory(), store)

// Initialize web3 and set in Redux.
getWeb3
.then(results => {
  console.log('Web3 initialized!')
})
.catch(() => {
  console.log('Error in web3 initialization.')
})

ReactDOM.render((
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}>
          <Route exact path="/" component={Home}/> 
        </Route>
        <Route path="/canvas" component={App}>
          <Route exact path="/canvas" component={Canvas} />
        </Route>
      </Router>
    </Provider>
  ),
  document.getElementById('root')
)

//<Route path="dashboard" component={UserIsAuthenticated(Dashboard)} />