import * as firebase from 'firebase';
import {Contract, ctr, LISTENERS} from '../contract/contract';
import * as Const from '../const/const';
import {GFD, GlobalState} from '../functions/GlobalState';
import * as FBC from '../private/firebaseConfig';

  const config = process.env.NODE_ENV === 'production'
    ? FBC.prodConfig
    : FBC.devConfig;

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

/*
Authentication works by auto grabbing the address of the user
from MetaMask and passing it to checkUserExists. This will return 
back true/false if the account exists and not populate 
the data and will not set the user to logged in.
*/
export class FireBase {
    constructor() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                GFD.setData('userSignedIn', true);
                if (ctr.account != null)
                    this.checkSignIn();
            } else {
                GFD.setData('userSignedIn', false);
            }
        });
    }

    signIn() {
        if (!GFD.getData('userSignedIn')) {
            firebase.auth().signInAnonymously().catch((error) => {
                console.info(error);
            });
        } else {
            this.checkSignIn();
        }
    }

    checkSignIn() {
        this.checkUserExists(ctr.account, (exists, user) => {
            if (!exists) {
                console.info('User not registered, requires sign up.');
                //we need to require account creation
            } else {
                console.info('User registered!');
                //unlock stuff for our verified user.
            }
        });
    }

    checkUserExists(wallet, callback) {
        firebase.database().ref('Accounts/' + wallet.toLowerCase()).once('value').then((snap) => {
            let exists = snap.exists();
            let user = {};
            if (exists) {
                user = snap.val();
            }
            GFD.setData('userExists', exists);
            GFD.setData('user', user);
            callback(exists, user);
        });
    }

    checkEmailExists(email, callback) {
        firebase.database().ref('Emails/' + email.replace(/\./g, ',')).once('value').then((snap) => {
            return callback(snap.exists());
        });
    }

    checkUsernameExists(username, callback) {
        firebase.database().ref('Usernames/' + username.toLowerCase()).once('value').then((snap) => {
            return callback(snap.exists());
        });
    }

    signUp(wallet, username, email, tosVersion, callback) {
        this.checkUserExists(wallet, (userExists, user) => {
            if (userExists) {
                return callback(true, ["User already signed up!"]);
            } else {
                if (tosVersion < Const.TOS_VERSION) 
                    return callback(false, ['Please agree to the Terms of Service first.']);
                
                if (!this.isEmailValid(email))
                    return callback(false, ['Invalid email format.']);

                if (!this.isUsernameValid(username))
                    return callback(false, ["Invalid username format.", "Please only user letters, numbers, '-', and '_'.", "Maximum length is 20 characters."]);
                 
                this.checkEmailExists(email, (exists) => {
                    if (exists)
                        return callback(false, ["Email address already in use."]);
                    this.checkUsernameExists(username, (existsUser) => {
                        if (existsUser) {
                            return callback(false, ["Username already in use."]);
                        } else {
                            let params = [
                                {
                                    type: 'string',         // Any valid solidity type
                                    name: 'email',          // Any string label you want
                                    value: email,           // The value to sign
                                },
                                {   
                                    type: 'string',
                                    name: 'username',
                                    value: username,
                                },
                                {   
                                    type: 'uint8',
                                    name: 'tosVersion',
                                    value: tosVersion,
                                }
                            ];   
                            ctr.sign(params, wallet, (result, message, signature) => {
                                if (result) {
                                    firebase.database().ref('/Accounts/' + wallet.toLowerCase()).set({
                                        wallet,
                                        email,
                                        signature,
                                        username,
                                        tosVersion,
                                    }).then(() => {
                                        firebase.database().ref('/Emails/' + email.replace(/\./g, ',')).set(true);
                                        firebase.database().ref('/Usernames/' + username.toLowerCase()).set(username);
                                        this.signIn();
                                        GFD.setData('tutorialStateIndex', 1);
                                    }).catch((error) => {
                                        console.info(error);
                                    });
                                }
                            })
                        }
                    });
                });
            }
        });
    }

    isEmailValid(email) {
        var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegex.test(String(email).toLowerCase());
    }

    isUsernameValid(username) {
        let usernameRegex = /^[a-zA-Z0-9-_]+$/;
        return usernameRegex.test(String(username)) && username.length <= 20;
    }
}

export const FB = new FireBase();