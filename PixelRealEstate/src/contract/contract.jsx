
// Import libraries we need.
import { default as Web3 } from 'web3';
import * as Const from '../const/const.jsx';
import * as Func from '../functions/functions.jsx';
import sigUtil from 'eth-sig-util';
import * as EVENTS from '../const/events';
import { default as contract } from 'truffle-contract';
import {GFD, GlobalState} from '../functions/GlobalState';
const FB = require('../const/firebase').FB;
import {SDM, ServerDataManager} from '../contract/ServerDataManager';
const ethers = require('ethers');
const CTRDATA = require('./ContractData');

// Import our contract artifacts and turn them into usable abstractions.
import VirtualRealEstate from '../../build/contracts/VirtualRealEstate.json'
import PXLProperty from '../../build/contracts/PXLProperty.json'
import StandardToken from '../../build/contracts/StandardToken.json'


export const ERROR_TYPE = {
    Success: 'green',
    Warning: 'orange',
    Error: 'red',
}
export const LISTENERS = {
    Error: 'Error',
    Alert: 'Alert',
    ShowForSale: 'ShowForSale',
    ServerDataManagerInit: 'ServerDataManagerInit',
    PendingSetPixelUpdate: 'PendingSetPixelUpdate',
}; 

export class Contract {
    constructor() {

        this.metamaskProvider = null; //for account connection to ETH
        this.provider = null; //for connection to ethereum for events

        this.accounts = null;
        this.account = null;
        this.VRE = null;//contract(VirtualRealEstate);
        this.PXLPP = null;//contract(PXLProperty);
        this.ST = null;//contract(StandardToken);

        this.startLoadBlock = 0;
        this.gasBuffer = 1.01; //extra gas added onto calculation.

        this.VREInstance = null;
        this.PXLPPInstance = null;
        this.STInstance = null;

        this.propertyTradeLog = [];

        this.setupRetryInterval = null;

        this.events = {
            event: null,
        }
        
        Object.keys(EVENTS).map((index) => {
            this.events[index] = {};
        });

        this.listeners = {};
        Object.keys(LISTENERS).map((index) => {
            this.listeners[index] = {};
        });

        this.setup();
    }

    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------       SETUP & MISC       ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------

    setup() {
        window.addEventListener('load', (ev) => {
            if (typeof web3 !== 'undefined') {
                window.web3 = new Web3(window.web3.currentProvider);
                console.info('Web3 & MetaMask.'); 

                window.ethereum.enable().then((accounts) => {

                    this.metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
                     this.metamaskProvider.ready.then((a,b,c) => {
                        this.metamaskProvider.resetEventsBlock(0);
                        console.info(this.metamaskProvider, accounts)
        
                        this.provider = new ethers.getDefaultProvider();
                        this.provider.resetEventsBlock(0);
            
                        this.updateNetwork((id) => {
                            if (id === Const.NETWORK_MAIN) {
                                GFD.setData('noMetaMask', false);
                                this.getAccount((acc) => {
                                    if (acc) {
                                    FB.checkSignIn();
                                    }
                                });
                    
                                this.updateNewestBlock();
                                SDM.init();
            
                            }
                        });
                     });
                });           
            } else {
                console.info('No MetaMask.');
                GFD.setData('noMetaMask', true);
                SDM.initNoMetaMask();
            }
        });
    }

    getAccount(callback = () => {}) {
        if (GFD.getData('noMetaMask')) {
            console.info('No MetaMask.');
            return callback(null);
        }

        if (this.account == null) {
            this.account = this.metamaskProvider.getSigner(0);
        }
        this.account.getAddress().then((address) => {
            this.account.address = address;
            callback(this.account);
        });

            // if (err != null) {
            //     if (GFD.getData('advancedMode')) {
            //         this.sendResults(LISTENERS.Error, {errorId: 1, errorType: ERROR_TYPE.Error, message: "In order to fully interact with the client, it is required to have the MetaMask.io web-plugin installed. MetaMask allows you to store your earnings securely in your own Ethereum lite-wallet. "});
            //     } else {
            //         this.sendResults(LISTENERS.Error, {errorId: 1, errorType: ERROR_TYPE.Error, message: "The canvas is updating every 15 seconds. Get instant updates with https://metamask.io/ ."});
            //     }
            //     return;
            // }

            // if (accs.length == 0) {
            //     if (GFD.getData('advancedMode')) {
            //         this.sendResults(LISTENERS.Error, {errorId: 0, errorType: ERROR_TYPE.Error, message: "Couldn't retrieve any accounts! Make sure you're logged into Metamask."});
            //     }
            //     GFD.setData('noAccount', true);
            //     return;
            // }

            // GFD.setData('noAccount', false);
            // this.sendResults(LISTENERS.Error, {removeErrors: [0, 1], message: ''});

            // this.accounts = accs;
            // if (this.account !== this.accounts[0].toLowerCase()) {
            //     this.account = this.accounts[0].toLowerCase();
            //     this.sendEvent(EVENTS.AccountChange, this.account);
            //     SDM.init();
            // }
    }

    updateNewestBlock() {
        if (this.startLoadBlock <= 0) {
            this.metamaskProvider.getBlockNumber().then((blockNumber) => {
                this.startLoadBlock = blockNumber;
            });
        }
    }

    /*
    Requests all events of event type EVENT.
    event = event type
    blocks = how many blocks to look back
    params = {}. for narrowing serach results
    */
    getEventLogs(event, params, callback, startBlock = 0, endBlock = 1) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return;

        let eventTopic = ethers.utils.id(event.eventAbi);

        let filter = {
            topics: [eventTopic],
            address: CTRDATA.VRE_Address,
            fromBlock: 0,
        };

        switch (event.id) {
            case EVENTS.PropertyBought.id:
            case EVENTS.PropertyColorUpdate.id:
            case EVENTS.SetUserHoverText.id:
            case EVENTS.SetUserSetLink.id:
            case EVENTS.PropertySetForSale.id:
            case EVENTS.DelistProperty.id:
            case EVENTS.SetPropertyPublic.id:
            case EVENTS.SetPropertyPrivate.id:
            case EVENTS.Bid.id:
                break;
            case EVENTS.Transfer.id:
            case EVENTS.Approval.id:
                filter.address = CTRDATA.PXL_Address;
                break;
            default:
                return;
        }

        return this._getEventLogs(filter, callback);
    }

    /*
    Requests all events of event type EVENT.
    block = how many blocks to look back
    */
    watchEventLogs(event, params, callback, blocks = 0) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return;

        this.updateNewestBlock();

        let eventTopic = ethers.utils.id(event.eventAbi);

        let filter = {
            topics: [eventTopic],
            address: CTRDATA.VRE_Address,
            fromBlock: 0,
        };

        this.metamaskProvider.resetEventsBlock(0);
        this.provider.resetEventsBlock(0);

        switch (event.id) {
            case EVENTS.PropertyBought.id:
            case EVENTS.PropertyColorUpdate.id:
            case EVENTS.SetUserHoverText.id:
            case EVENTS.SetUserSetLink.id:
            case EVENTS.PropertySetForSale.id:
            case EVENTS.DelistProperty.id:
            case EVENTS.SetPropertyPublic.id:
            case EVENTS.SetPropertyPrivate.id:
            case EVENTS.Bid.id:
                return this._watchVREEventLogs(event, callback);
            case EVENTS.Transfer.id:
            case EVENTS.Approval.id:
                return this._watchPXLEventLogs(event, callback);
            default:
                console.warn('Error on event', event);
                return;
        }
    }

    _watchVREEventLogs(event, callback) {
        this.getVREContract((i) => {
            i.on(event.id, callback);
            let obj = {
                eventID: event.id,
                eventCallback: callback,
                stopWatching: () => {
                    i.removeListener(obj.eventID, obj.eventCallback);
                    delete obj.eventCallback;
                }
            };
            return obj;
        });
    }

    _watchPXLEventLogs(event, callback) {
        this.getPXLContract((i) => {
            i.on(event.id, callback);
            let obj = {
                eventID: event.id,
                eventCallback: callback,
                stopWatching: () => {
                    i.removeListener(obj.eventID, obj.eventCallback);
                    delete obj.eventCallback;
                }
            };
            return obj;
        });
    }

    toID(x, y) {
        return y * Const.PROPERTIES_WIDTH + x;
    }

    fromID(id) {
        let obj = {x: 0, y: 0};
        obj.x = id % Const.PROPERTIES_WIDTH;
        obj.y = Math.floor(id / 100);
        return obj;
    }

    getVREContract(callback/*(contract)*/) {
        if (!this.VRE || this.account == null) {
            this.getAccount((acc) => {
                this.VRE = new ethers.Contract(CTRDATA.VRE_Address, CTRDATA.VRE_ABI, acc || this.provider);
                if (acc) {
                    this.VRE.connect(acc);
                }
                return callback(this.VRE);
            });
        } else {
            return callback(this.VRE);
        }
    }

    getPXLContract(callback/*(contract)*/) {
        if (!this.PXLPP || this.account == null) {
            this.getAccount((acc) => {
                this.PXLPP = new ethers.Contract(CTRDATA.PXL_Address, CTRDATA.PXL_ABI, acc || this.provider);
                if (acc) {
                    this.PXLPP.connect(acc);
                }
                return callback(this.PXLPP);
            });
        } else {
            return callback(this.PXLPP);
        }
    }

    updateNetwork(callback = () => {}) {
        window.web3.eth.net.getId().then((netId) => {
            switch (netId) {
              case 1:
                GFD.setData('network', Const.NETWORK_MAIN);
                callback(Const.NETWORK_MAIN);
                break
              case 3:
                GFD.setData('network', Const.NETWORK_ROPSTEN);
                callback(Const.NETWORK_ROPSTEN);
                break
              case 4:
                GFD.setData('network', Const.NETWORK_RINKEBY);
                callback(Const.NETWORK_RINKEBY);
                break
              case 42:
                GFD.setData('network', Const.NETWORK_KOVAN);
                callback(Const.NETWORK_KOVAN);
                break
              default:
                GFD.setData('network', Const.NETWORK_DEV);
                callback(Const.NETWORK_DEV);
            }
        })
    }

    /*
        
        callback:
            bool: isValid,
            string: response message,
            string: signature,
    */
    sign(params, signer, callback) {
        window.web3.currentProvider.sendAsync({
            method: 'eth_signTypedData',
            params: [params, signer],
            from: signer,
        }, (err, result) => {
            if (err) {
                this.sendResults(LISTENERS.Alert, {result: false, message: 'Unable to sign message with this wallet.'});
                return callback(false, 'Unable to sign message with this wallet.', null);
            }
            if (this.verify(params, result.result, signer)) {
                callback(true, 'Message signed successfully', result.result);
            } else {
                callback(false, 'Unable to sign message with this wallet.', null);
            }
        })
    }

    verify(params, signature, signer) {
        const recovered = sigUtil.recoverTypedSignature({
            data: params,
            sig: signature
        })
        return recovered === signer.toLowerCase();
    }

    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------       SETUP & MISC       ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------



    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ----------------------------------         SETTERS         ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------

    setupContracts() {
        // for connecting new contracts together so we know which are the current ones
        // this.PXLPP.deployed().then((PXLPPInstance) => {
        //     this.VRE.deployed().then((VREInstance) => {
        //         PXLPPInstance.setPixelPropertyContract(VREInstance.address, {from: this.account}).then((r) => {console.info(r)}).catch((e) => {console.info(e)});
        //         VREInstance.setPXLPropertyContract(PXLPPInstance.address, {from: this.account}).then((r) => {console.info(r)}).catch((e) => {console.info(e)});
        //     });
        // });
    }

    buyProperty(x, y, eth, ppc, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return callback(false);
        this.getVREContract((i) => {
            if (eth == 0) {
                return i.buyPropertyInPXL(this.toID(x, y), ppc).then((tx) => {
                    this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " purchase complete."});
                    callback(true);
                    return;
                }).catch((e) => {
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Unable to purchase property " + (x + 1) + "x" + (y + 1) + "."});
                    console.info(e);
                    callback(false);
                    return;
                })
            } else if (ppc == 0) {
                return i.buyPropertyInETH(this.toID(x, y)).then((tx) => {
                    this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " purchase complete."});
                    callback(true);
                    return;
                }).catch((e) => {
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Unable to purchase property " + (x + 1) + "x" + (y + 1) + "."});
                    console.info(e);
                    callback(false);
                    return;
                })
            } else {
                return i.buyProperty(this.toID(x, y), ppc).then((tx) => {
                    this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " purchase complete."});
                    callback(true);
                    return;
                }).catch((e) => {
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Unable to purchase property " + (x + 1) + "x" + (y + 1) + "."});
                    console.info(e);
                    callback(false);
                    return;
                })
            }
        });
    }

    sellProperty(x, y, price, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return;
        this.getVREContract((i) => {
            return i.listForSale(this.toID(parseInt(x), parseInt(y)), price).then((tx) => {
                this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " listed for sale."});
                return callback(true);
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Unable to put property " + (x + 1) + "x" + (y + 1) + " on market."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    delistProperty(x, y, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return callback(false);
        this.getVREContract((i) => {
            i.delist(this.toID(parseInt(x), parseInt(y))).then((tx) => {
                callback(true);
                this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " listed for sale."});
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Error cancelling sale offer for " + (x + 1) + "x" + (y + 1) + "."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    setPropertyMode(x, y, isPrivate, minutesPrivate, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return callback(false);
        this.getVREContract((i) => {
            return i.setPropertyMode(this.toID(parseInt(x), parseInt(y)), isPrivate, minutesPrivate).then((tx) => {
                return callback(true);
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Error updating Property " + (x + 1) + "x" + (y + 1) + " mode."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    //array of 2 32 bytes of string
    setHoverText(text, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return;
        this.getVREContract((i) => {
            return i.setHoverText(Func.StringToBigInts(text)).then((tx) => {
                callback(true);
                console.info("Hover text set!");
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Error setting hover text."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    //array of 2 32 bytes
    setLink(text, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return;
        this.getVREContract((i) => {
            return i.setLink(Func.StringToBigInts(text)).then((tx) => {
                callback(true);
                console.info("Property link updated!");
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Error setting link."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    transferProperty(x, y, newOwner, callback) { 
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return callback(false);
        if (!this.isAddress(newOwner)) {
            this.sendResults(LISTENERS.Alert, {result: false, message: "Not a valid address! Aborting."});
            return callback(false);
        }
        this.getVREContract((i) => {
            return i.transferProperty(this.toID(parseInt(x), parseInt(y)), newOwner).then((tx) => {
                return callback(true);
            });
        });
    }

    makeBid(x, y, bid, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return callback(false);
        this.getVREContract((i) => {
            return i.makeBid(this.toID(x, y), bid).then((tx) => {
                callback(true);
                this.sendResults(LISTENERS.Alert, {result: true, message: "Bid for " + (x + 1) + "x" + (y + 1) + " sent to owner."});
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Error placing bid on Property " + (x + 1) + "x" + (y + 1) + "."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    setColors(x, y, data, PPT, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return callback(false);
        this.getVREContract((i) => {
            callback('pending');
            i.setColors(this.toID(x, y), Func.RGBArrayToContractData(data), PPT).then((tx) => {
                callback(true);
                this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " pixels changed."});
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Error uploading image to Property " + (x + 1) + "x" + (y + 1) + "."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    sendPXL(PXL, address, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return callback(false);
        if (!this.isAddress(address)) {
            this.sendResults(LISTENERS.Alert, {result: false, message: "Not a valid address! Aborting."});
            return callback(false);
        }
        this.getPXLContract((i) => {
            i.transfer(address, PXL).then((tx) => {
                callback(true);
                this.sendResults(LISTENERS.Alert, {result: true, message: PXL + " PXL sent to address " + address + "."});
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Error sending PXL to " + address + "."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ----------------------------------         SETTERS         ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------








    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ----------------------------------         GETTERS         ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    getCurrentBlock(callback, pending = false) {
        window.web3.eth.getBlock(pending ? 'pending' : 'latest', false, callback);
    }

    isAddress(address) {
        if (GFD.getData('ServerDataManagerInit') < 2)
            return false;
        return window.web3.utils.isAddress(address);
    }

    getBalance(callback) {
        if (GFD.getData('noMetaMask'))
            return callback(0);
        this.getPXLContract((pxlCtr) => {
            this.getAccount((acc) => {
                pxlCtr.balanceOf(acc.address).then((r) => {
                    callback(Func.BigNumberToNumber(r));
                });
            });
        });
    }

    getBalanceOf(address, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(0);
        this.getPXLContract((i) => {
            i.balanceOf(address, { from: this.account }).then((r) => {
                callback(Func.BigNumberToNumber(r));
            });
        })
    }

    getSystemSalePrices(callback) {
        if (GFD.getData('noMetaMask'))
            return callback(null);
        this.getVREContract((i) => {
            return i.getSystemSalePrices().then((r) => {
                return callback(r);
            });
        });
    }

    getForSalePrices(x, y, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        this.getVREContract((i) => {
            return i.getForSalePrices(this.toID(x, y)).then((r) => {
                return callback(r);
            });
        })
    }

    getHoverText(address, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        this.getPXLContract((i) => {
            return i.getOwnerHoverText(address).then((r) => {
                return callback(Func.BigIntsToString(r));
            });
        });
    }

    getLink(address, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        this.getPXLContract((i) => {
            return i.getOwnerLink(address).then((r) => {
                return callback(Func.BigIntsToString(r));
            });
        })
    }

    getPropertyColorsOfRow(x, row, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        this.getPXLContract((i) => {
            return i.getPropertyColorsOfRow(x, row).then((r) => {
                callback(x, row, Func.ContractDataToRGBAArray(r));
            });
        })
    }

    getPropertyColors(x, y, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        this.getPXLContract((i) => {
            return i.getPropertyColors(this.toID(x, y)).then((r) => {
                if (r[0] == 0 && r[1] == 0 && r[2] == 0 && r[3] == 0 && r[4] == 0)
                    callback(x, y, Func.ContractDataToRGBAArray(r), true);
                else
                    callback(x, y, Func.ContractDataToRGBAArray(r), false);
            });
        });
    }

    getPropertyData(x, y, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        //returns address, price, renter, rent length, rentedUntil, rentPrice
        this.getVREContract((i) => {
            i.getPropertyData(this.toID(x, y)).then((r) => {
                return callback(r);
            });
        });
    }

    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ----------------------------------         GETTERS         ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------



    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ----------------------------------         EVENTS          ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------

    /*
    Subscriber functions for gnereal updates.
    Events that are being used:
        Alerts
    */
    listenForResults(listener, key, callback) {
        this.listeners[listener][key] = callback;
    }

    stopListeningForResults(listener, key) {
        delete this.listeners[listener][key];
    }

    sendResults(listener, result) {
        Object.keys(this.listeners[listener]).map((i) => {
            this.listeners[listener][i](result);
        });
    }

    /*
    Subscriber functions for function call returns from events fired on the 
    contract.
    */
    listenForEvent(event, key, callback) {
        if (event !== EVENTS.AccountChange)
            throw 'No longer using events for contract events. Use get/watchEventLogs';
        this.events[event][key] = callback;
    }

    stopListeningForEvent(event, key) {
        delete this.events[event][key];
    }

    sendEvent(event, result) {
        Object.keys(this.events[event]).map((i) => {
            this.events[event][i](result);
        });
    }

    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ----------------------------------         EVENTS          ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
}

export const ctr = new Contract();