import * as firebase from 'firebase';
import {Contract, ctr, LISTENERS} from '../contract/contract';
import * as Const from '../const/const';
import {GFD, GlobalState} from '../functions/GlobalState';
import * as FBC from '../../private/firebaseConfig';

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
        this.chatListenerToken = null;
        this.chatRemoveListenerToken = null;
        this.refersListenerToken = null;
        this.earnedListenerToken = null
        this.listenerReferrerWallet = null;
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                ctr.getAccount((acc) => {
                    GFD.setData('userSignedIn', ctr != null);
                    if (acc != null)
                        this.checkSignIn();
                });
            }
        });
    }

    watchReferrals(wallet, refersUpdatedCallback, earnedUpdatedCallback) {
        this.stopWatchingReferrals();
        this.refersListenerToken = firebase.database().ref('/Referral/'+wallet+'/refers').on('value', refersUpdatedCallback);
        this.earnedListenerToken = firebase.database().ref('/Referral/'+wallet+'/earned').on('value', earnedUpdatedCallback);
        this.listenerReferrerWallet = wallet;

    }

    stopWatchingReferrals() {
        if (this.listenerReferrerWallet == null)
            return;
        if (this.refersListenerToken != null)
            firebase.database().ref('/Referral/'+this.listenerReferrerWallet+'/refers').on('value', this.refersListenerToken);
        if (this.earnedListenerToken != null)
            firebase.database().ref('/Referral/'+this.listenerReferrerWallet+'/earned').on('value', this.earnedListenerToken);
    }

    watchChat(msgReceivedCallback, msgDeletedCallback) {
        this.stopWatchingChat();
        this.chatListenerToken = firebase.database().ref('/Chat').on('child_added', msgReceivedCallback);
        this.chatRemoveListenerToken = firebase.database().ref('/Chat').on('child_removed', msgDeletedCallback);
    }

    stopWatchingChat() {
        if (this.chatListenerToken != null)
            firebase.database().ref('/Chat').off('child_added', this.chatListenerToken);
        if (this.chatRemoveListenerToken != null)
            firebase.database().ref('/Chat').off('child_removed', this.chatRemoveListenerToken);
    }

    sendChatMessage(message, callback) {
        if (!GFD.state.userExists) {
            callback('fail');
            return;
        }

        if (GFD.state.user != null && GFD.state.user.mutedUntil != null && GFD.state.user.mutedUntil >= new Date().getTime()) {
            callback('muted');
            return;
        }

        this.checkUserExists(ctr.account.address, (exists, user) => {
            if (exists && (user.mutedUntil == null || user.mutedUntil < new Date().getTime())) {

                message = message.substring(0, Math.min(message.length, 100));

                firebase.database().ref('Chat').push({
                    walletID: GFD.state.user.wallet,
                    username: GFD.state.user.username,
                    timestamp: new Date().getTime(),
                    message,
                }).then(() => {
                    callback('success');
                }).catch((error) => {
                    console.info(error);
                    callback('fail');
                });

            }
        });
    }

    deleteChatMessage(messageID) {
        firebase.database().ref('/Chat').child(messageID).remove();
    }

    muteChatUser(walletID, until) {
        firebase.database().ref('/Accounts').child(walletID).child('/mutedUntil').set(until);
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
        this.checkUserExists(ctr.account.address, (exists, user) => {
            if (!exists) {
                console.info('User not registered, requires sign up.');
                GFD.setData('userExists', false);
                GFD.setData('user', null);
            } else {
                console.info('User registered!');
                GFD.setData('advancedMode', true);
                GFD.setData('userExists', exists);
                GFD.setData('user', user);
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

    signUp(wallet, username, email, tosVersion, referralAddress, ipAddresses, callback) {
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

                                    let userIP = null;
                                    if (ipAddresses != null && Array.isArray(ipAddresses) && ipAddresses.length > 0) {
                                        userIP = ipAddresses[ipAddresses.length - 1];
                                    }

                                    firebase.database().ref('/Accounts/' + wallet.toLowerCase()).set({
                                        wallet,
                                        email,
                                        signature,
                                        username,
                                        tosVersion,
                                        registerTime: new Date().getTime(),
                                        ip: userIP, 
                                    }).then(() => {
                                        let updates = {};
                                        updates['/Emails/' + email.replace(/\./g, ',')] = true;
                                        updates['/Usernames/' + username.toLowerCase()] = username;
                                        this.signIn();
                                        if (userIP != null && referralAddress != '' && referralAddress != null) {
                                            updates['/Referral/' + referralAddress.toLowerCase() +'/ips/' + userIP.replace(/\./g, ',')] = {
                                                wallet,
                                                verified: false,
                                            };
                                        }
                                        firebase.database().ref().update(updates);
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