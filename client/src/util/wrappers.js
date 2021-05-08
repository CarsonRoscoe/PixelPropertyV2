// import { routerActions } from 'react-router-redux';
// import { connectedReduxRedirect } from 'redux-auth-wrapper/history3/redirect'
// import connectedAuthWrapper from 'redux-auth-wrapper/connectedAuthWrapper'

// // Layout Component Wrappers
// const UserIsAuthenticated = connectedReduxRedirect({
//   redirectPath: '/login',
//   authenticatedSelector: state => state.user.data !== null,
//   redirectAction: routerActions.replace,
//   failureRedirectPath: '/', // '/login' by default.
//   wrapperDisplayName: 'UserIsAuthenticated'
// });

// const UserIsNotAuthenticated = connectedReduxRedirect({
//   redirectPath: '/login',
//   authenticatedSelector: state => state.user.data !== null,
//   redirectAction: routerActions.replace,
//   failureRedirectPath: (state, ownProps) => ownProps.location.query.redirect || '/dashboard',
//   wrapperDisplayName: 'UserIsNotAuthenticated',
//   allowRedirectBack: false
// });

// // UI Component Wrappers

// const VisibleOnlyAuth = connectedAuthWrapper({
//   redirectPath: '/login',
//   authenticatedSelector: state => state.user.data !== null,
//   wrapperDisplayName: 'VisibleOnlyAuth',
// });

// const HiddenOnlyAuth = connectedAuthWrapper({
//   redirectPath: '/login',
//   authenticatedSelector: state => state.user !== null,
//   wrapperDisplayName: 'HiddenOnlyAuth',
// });

// const wrappers = {
//   UserIsAuthenticated,
//   UserIsNotAuthenticated,
//   VisibleOnlyAuth,
//   HiddenOnlyAuth
// }

// export default wrappers;



import { routerActions } from 'react-router-redux'
import { connectedReduxRedirect } from 'redux-auth-wrapper/history3/redirect'
import connectedAuthWrapper from 'redux-auth-wrapper/connectedAuthWrapper'

// Layout Component Wrappers

export const UserIsAuthenticated = connectedReduxRedirect({
  redirectPath: '/login',
  authSelector: state => state.user.data,
  redirectAction: routerActions.replace,
  failureRedirectPath: '/', // '/login' by default.
  wrapperDisplayName: 'UserIsAuthenticated'
})

export const UserIsNotAuthenticated = connectedReduxRedirect({
  redirectPath: '/login',
  authSelector: state => state.user,
  redirectAction: routerActions.replace,
  failureRedirectPath: (state, ownProps) => ownProps.location.query.redirect || '/dashboard',
  wrapperDisplayName: 'UserIsNotAuthenticated',
  predicate: user => user.data === null,
  allowRedirectBack: false
})

// UI Component Wrappers

export const VisibleOnlyAuth = connectedAuthWrapper({
  redirectPath: '/login',
  authSelector: state => state.user,
  wrapperDisplayName: 'VisibleOnlyAuth',
  predicate: user => user.data,
  FailureComponent: null
})

export const HiddenOnlyAuth = connectedAuthWrapper({
  redirectPath: '/login',
  authSelector: state => state.user,
  wrapperDisplayName: 'HiddenOnlyAuth',
  predicate: user => user.data === null,
  FailureComponent: null
})
