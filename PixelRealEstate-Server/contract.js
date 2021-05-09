const ethers = require('ethers');
const Web3 = require('web3');
const contract = require("truffle-contract");
const path = require('path');
const VREPath = require(path.join(__dirname, 'build/contracts/VirtualRealEstate.json'));
const PXLPPPath = require(path.join(__dirname, 'build/contracts/PXLProperty.json'));
const Func = require('./functions.js');
const Timer = require('./timer.js');
const CTRDATA = require('./contracts/ContractData');

const PROPERTIES_WIDTH = 100;

const EVENTS = {
    PropertyColorUpdate: 'PropertyColorUpdate', //(uint24 indexed property, uint256[10] colors, uint256 lastUpdate, address lastUpdaterPayee);
    PropertyColorUpdatePixel: 'PropertyColorUpdatePixel', //(uint24 indexed property, uint8 row, uint24 rgb);

    SetUserHoverText: 'SetUserHoverText', //(address indexed user, bytes32[2] newHoverText);
    SetUserSetLink: 'SetUserSetLink', //(address indexed user, bytes32[2] newLink);

    PropertyBought: 'PropertyBought', //(uint24 indexed property,  address newOwner);
    PropertySetForSale: 'PropertySetForSale', //(uint24 indexed property, uint256 forSalePrice);
    DelistProperty: 'DelistProperty', //(uint24 indexed property);

    ListTradeOffer: 'ListTradeOffer', //(address indexed offerOwner, uint256 eth, uint256 pxl, bool isBuyingPxl);
    AcceptTradeOffer: 'AcceptTradeOffer', //(address indexed accepter, address indexed offerOwner);
    CancelTradeOffer: 'CancelTradeOffer', //(address indexed offerOwner);

    SetPropertyPublic: 'SetPropertyPublic', //(uint24 indexed property);
    SetPropertyPrivate: 'SetPropertyPrivate', //(uint24 indexed property, uint32 numHoursPrivate);

    Bid: 'Bid', //(uint24 indexed property, uint256 bid);

    //token events    
    Transfer: 'Transfer', //(address indexed _from, address indexed _to, uint256 _value);
    Approval: 'Approval', //(address indexed _owner, address indexed _spender, uint256 _value);
};

class Contract {
    constructor() {
        this.VRE = null; //DApp contract reference
        this.PXLPP = null; //Storage contract reference

        // Setup RPC connection   
        // 52.169.42.101:30303
        this.provider = ethers.getDefaultProvider();//new Web3.providers.HttpProvider("http://127.0.0.1:8545"); //window.web3.currentProvider

        // Read JSON and attach RPC connection (Provider)
        // this.VRE = contract(VREPath);
        // this.VRE.setProvider(VREProvider);
        // this.PXLPP = contract(PXLPPPath);
        // this.PXLPP.setProvider(VREProvider);
        this.getVREContract(() => {});
        this.getPXLContract(() => {});
    }

    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------       SETUP & MISC       ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------

    getVREContract(callback/*(contract)*/) {
        if (!this.VRE) {
            this.VRE = new ethers.Contract(CTRDATA.VRE_Address, CTRDATA.VRE_ABI, this.provider);
        }
        return callback(this.VRE);
    }

    getPXLContract(callback/*(contract)*/) {
        if (!this.PXLPP) {
            this.PXLPP = new ethers.Contract(CTRDATA.PXL_Address, CTRDATA.PXL_ABI, this.provider);
        }
        return callback(this.PXLPP);
    }

    getAccounts() {
        window.web3.eth.getAccounts((err, accs) => {
            if (err != null) {
                if (GFD.getData('advancedMode')) {
                    this.sendResults(LISTENERS.Error, { errorId: 1, errorType: ERROR_TYPE.Error, message: "In order to fully interact with the client, it is required to have the MetaMask.io web-plugin installed. MetaMask allows you to store your earnings securely in your own Ethereum lite-wallet. " });
                } else {
                    this.sendResults(LISTENERS.Error, { errorId: 1, errorType: ERROR_TYPE.Error, message: "The canvas is updating every 15 seconds. Get instant updates with https://metamask.io/ ." });
                }
                return;
            }

            if (accs.length == 0) {
                if (GFD.getData('advancedMode')) {
                    this.sendResults(LISTENERS.Error, { errorId: 0, errorType: ERROR_TYPE.Error, message: "Couldn't get any accounts! Make sure you're logged into Metamask." });
                    GFD.setData('noAccount', true);
                }
                return;
            }

            GFD.setData('noAccount', false);
            this.sendResults(LISTENERS.Error, { removeErrors: [0, 1], message: '' });

            this.accounts = accs;
            if (this.account !== this.accounts[0].toLowerCase()) {
                this.account = this.accounts[0].toLowerCase();
                this.sendEvent(EVENTS.AccountChange, this.accounts[0]);
            }
        });
    }

    // setupEvents() {
    //     this.VRE.deployed().then((instance) => {
    //         this.events.event = instance.allEvents({fromBlock: 0, toBlock: 'latest'});
    //         SDM.init();
    //         this.listenForResults(LISTENERS.ServerDataManagerInit, 'contract', () => {
    //             this.stopListeningForResults(LISTENERS.ServerDataManagerInit, 'contract');
    //             this.events.event.watch((error, result) => {
    //                 if (error) {
    //                     console.info(result, error);
    //                 } else {
    //                     for (let i = 0; i < result.length; i++)
    //                         this.sendEvent(result[i].event, result[i]);
    //                 }
    //             });
    //         });
    //     }).catch((c) => {
    //         console.info(c);
    //     });
    // }

    /*
    Requests all events of event type EVENT.
    */
    getEventLogs(event, params = {}, callback) {

        let filter = { fromBlock: 0, toBlock: 'latest' };

        // VRE Dapp Events
        this.VRE.deployed().then((i) => {
            switch (event) {
                case EVENTS.PropertyBought:
                    return i.PropertyBought(params, filter).get(callback);
                case EVENTS.PropertyColorUpdate:
                    return i.PropertyColorUpdate(params, filter).get(callback);
                case EVENTS.SetUserHoverText:
                    return i.SetUserHoverText(params, filter).get(callback);
                case EVENTS.SetUserSetLink:
                    return i.SetUserSetLink(params, filter).get(callback);
                case EVENTS.PropertySetForSale:
                    return i.PropertySetForSale(params, filter).get(callback);
                case EVENTS.DelistProperty:
                    return i.DelistProperty(params, filter).get(callback);
                case EVENTS.SetPropertyPublic:
                    return i.SetPropertyPublic(params, filter).get(callback);
                case EVENTS.SetPropertyPrivate:
                    return i.SetPropertyPrivate(params, filter).get(callback);
                case EVENTS.Bid:
                    return i.Bid(params, filter).get(callback);
            }
        }).catch((e) => {
            console.error(e);
        });

        // ERC20 PXL Events
        this.PXLPP.deployed().then((i) => {
            switch (event) {
                case EVENTS.Transfer:
                    return i.Transfer(params, filter).get(callback);
                case EVENTS.Approval:
                    return i.Approval(params, filter).get(callback);
            }
        }).catch((e) => {
            console.error(e);
        });
    }

    /*
    Requests all events of event type EVENT.
    */
    watchEventLogs(event, params, callback) {
        let filter = { fromBlock: 0, toBlock: 'latest' };

        switch (event) {
            case EVENTS.PropertyBought:
            case EVENTS.PropertyColorUpdate:
            case EVENTS.SetUserHoverText:
            case EVENTS.SetUserSetLink:
            case EVENTS.PropertySetForSale:
            case EVENTS.DelistProperty:
            case EVENTS.SetPropertyPublic:
            case EVENTS.SetPropertyPrivate:
            case EVENTS.Bid:
                return this._watchVREEventLogs(event, callback);
            case EVENTS.Transfer:
            case EVENTS.Approval:
                return this._watchPXLEventLogs(event, callback);
        }
    }

    _watchVREEventLogs(event, callback) {
        return this.getVREContract((i) => {
            i.on(event, callback);
        });
    }

    _watchPXLEventLogs(event, callback) {
        return this.getPXLContract((i) => {
            i.on(event, callback);
        });
    }

    toID(x, y) {
        return y * PROPERTIES_WIDTH + x;
    }

    fromID(id) {
            let obj = { x: 0, y: 0 };
            obj.x = id % PROPERTIES_WIDTH;
            obj.y = Math.floor(id / 100);
            return obj;
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

    buyProperty(x, y, eth, ppc, callback) {
        console.info(x, y, eth, ppc);
        this.VRE.deployed().then((i) => {
            if (eth == 0)
                return i.buyPropertyInPPC(this.toID(x, y), ppc, { from: this.account });
            else if (ppc == 0)
                return i.buyPropertyInETH(this.toID(x, y), { value: eth, from: this.account });
            else
                return i.buyProperty(this.toID(x, y), ppc, { value: eth, from: this.account });
        }).then(() => {
            callback(true);
            this.sendResults(LISTENERS.Alert, { result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " purchase complete." });
        }).catch((e) => {
            callback(false);
            console.info(e);
            this.sendResults(LISTENERS.Alert, { result: false, message: "Unable to purchase property " + (x + 1) + "x" + (y + 1) + "." });
        });
    }

    sellProperty(x, y, price) {
        this.VRE.deployed().then((i) => {
            return i.listForSale(this.toID(parseInt(x), parseInt(y)), price, { from: this.account });
        }).then(() => {
            this.sendResults(LISTENERS.Alert, { result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " listed for sale." });
        }).catch((e) => {
            console.log(e);
            this.sendResults(LISTENERS.Alert, { result: false, message: "Unable to put property " + (x + 1) + "x" + (y + 1) + " on market." });
        });
    }

    delistProperty(x, y, callback) {
        this.VRE.deployed().then((i) => {
            return i.delist(this.toID(parseInt(x), parseInt(y)), { from: this.account });
        }).then(() => {
            callback(true);
            this.sendResults(LISTENERS.Alert, { result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " listed for sale." });
        }).catch((e) => {
            console.log(e);
            callback(false);
            this.sendResults(LISTENERS.Alert, { result: false, message: "Unable to put property " + (x + 1) + "x" + (y + 1) + " on market." });
        });
    }

    setPropertyMode(x, y, isPrivate, minutesPrivate, callback) {
        this.VRE.deployed().then((i) => {
            return i.setPropertyMode(this.toID(parseInt(x), parseInt(y)), isPrivate, minutesPrivate, { from: this.account });
        }).then((r) => {
            return callback(r);
        }).catch((e) => {
            console.log(e);
        });
    }

    //array of 2 32 bytes of string
    setHoverText(text) {
        this.VRE.deployed().then((i) => {
            return i.setHoverText(Func.StringToBigInts(text), { from: this.account });
        }).then(function() {
            console.info("Hover text set!");
        }).catch((e) => {
            console.log(e);
        });
    }

    //array of 2 32 bytes
    setLink(text) {
        this.VRE.deployed().then((i) => {
            return i.setLink(Func.StringToBigInts(text), { from: this.account });
        }).then(function() {
            console.info("Property link updated!");
        }).catch((e) => {
            console.log(e);
        });
    }

    transferProperty(x, y, newOwner, callback) {
        this.VRE.deployed().then((i) => {
            return i.transferProperty(this.toID(parseInt(x), parseInt(y)), newOwner, { from: this.account }).then((r) => {
                return callback(true);
            }).catch((e) => {
                console.error(e);
            });
        }).catch((e) => {
            return callback(false);
        });
    }

    makeBid(x, y, bid, callback) {
        this.VRE.deployed().then((i) => {
            return i.makeBid(this.toID(x, y), bid, { from: this.account });
        }).then(() => {
            callback(true);
            this.sendResults(LISTENERS.Alert, { result: true, message: "Bid for " + (x + 1) + "x" + (y + 1) + " sent to owner." });
        }).catch((e) => {
            callback(false);
            this.sendResults(LISTENERS.Alert, { result: false, message: "Error placing bid." });
        });
    }

    setColors(x, y, data, PPT, callback) {
        this.VRE.deployed().then((i) => {
            return i.setColors(this.toID(x, y), Func.RGBArrayToContractData(data), PPT );
        }).then(() => {
            callback(true);
            this.sendResults(LISTENERS.Alert, { result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " pixels changed." });
        }).catch((e) => {
            callback(false);
            this.sendResults(LISTENERS.Alert, { result: false, message: "Error uploading pixels." });
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
    getBalance(callback) {
        this.PXLPP.deployed().then((i) => {
            i.balanceOf(this.account, { from: this.account }).then((r) => {
                callback(Func.BigNumberToNumber(r));
            }).catch((e) => {
                console.error(e);
            });
        }).catch((e) => {
            console.info(e);
            this.sendResults(LISTENERS.Error, { result: false, message: "Unable to retrieve PPC balance." });
        });
    }

    getSystemSalePrices(callback) {
        this.VRE.deployed().then((i) => {
            return i.getSystemSalePrices.call().then((r) => {
                return callback(r);
            }).catch((e) => {
                console.error(e);
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getForSalePrices(x, y, callback) {
        this.VRE.deployed().then((i) => {
            return i.getForSalePrices.call(this.toID(x, y)).then((r) => {
                return callback(r);
            }).catch((e) => {
                console.error(e);
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getHoverText(address, callback) {
        this.PXLPP.deployed().then((i) => {
            return i.getOwnerHoverText.call(address).then((r) => {
                return callback(Func.BigIntsToString(r));
            }).catch((e) => {
                console.error(e);
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getLink(address, callback) {
        this.PXLPP.deployed().then((i) => {
            return i.getOwnerLink.call(address).then((r) => {
                return callback(Func.BigIntsToString(r));
            }).catch((e) => {
                console.error(e);
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getPropertyColorsOfRow(x, row, callback) {
        this.PXLPP.deployed().then((i) => {
            return i.getPropertyColorsOfRow.call(x, row).then((r) => {
                callback(x, row, Func.ContractDataToRGBAArray(r));
            }).catch((e) => {
                console.error(e);
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getPropertyColors(x, y, callback) {
        this.getPXLContract((i) => {
            return i.getPropertyColors(this.toID(x, y)).then((r) => {
                if (r[0] == 0 && r[1] == 0 && r[2] == 0 && r[3] == 0 && r[4] == 0)
                    callback(x, y, null);
                else
                    callback(x, y, Func.ContractDataToRGBAArray(r));
            }).catch((e) => {
                console.error(e);
            });
        });
    }

    getPropertyData(x, y, callback) {
        //returns address, price, renter, rent length, rentedUntil, rentPrice
        this.getVREContract((i) => {
            i.getPropertyData(this.toID(x, y)).then((r) => {
                return callback(x, y, r);
            }).catch((e) => {
                console.error(e);
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
            console.error('No longer using events for contract events. Use get/watchEventLogs');
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

module.exports.instance = new Contract();
module.exports.EVENTS = EVENTS;