import React, { Component } from 'react'
import { Link } from 'react-router'
import { HiddenOnlyAuth, VisibleOnlyAuth } from './util/wrappers.js'
import Alerts from './layouts/Alerts';
import HttpsRedirect from 'react-https-redirect';

import './css/index.scss';

class App extends Component {
  render() {
    return (
      <div>
        <HttpsRedirect>
          {this.props.children}
        </HttpsRedirect>
        <Alerts/>
      </div>
    );
  }
}

export default App
