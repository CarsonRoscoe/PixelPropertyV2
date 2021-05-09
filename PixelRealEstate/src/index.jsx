import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import { UserIsAuthenticated, UserIsNotAuthenticated } from './util/wrappers.js'

// Layouts
import App from './App'
import Home from './layouts/home/Home'
import Canvas from './layouts/canvas/CanvasPage'
// Redux Store
import store from './store'

// Initialize react-router-redux.
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render((
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={Home} />
        </Route>
        <Route path="/canvas" component={App}>
          <IndexRoute component={Canvas} />
        </Route>
      </Router>
    </Provider>
  ),
  document.getElementById('root')
)

//<Route path="dashboard" component={UserIsAuthenticated(Dashboard)} />