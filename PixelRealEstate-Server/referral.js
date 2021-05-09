const flags = require('./flags.js');
const FBC = require('./ssl/firebaseConfig.js');
const firebase = require('firebase');
const web3 = require('./contract.js').web3;

const payoutTimeProd = 86400000;
const payoutTimeDev = 5000;

class Referral {
    constructor() {
        this.isDev = flags.ENV_DEV ? true : false;
        this.payoutLoopHandle = null;
        this._init();
    }

    _init() {
        firebase.initializeApp(this.isDev ? FBC.devConfig : FBC.prodConfig);
    }

    startPayoutLoop() {
        this.payoutLoopHandle = setInterval(this.triggerPayout, this.isDev ? payoutTimeDev : payoutTimeProd);
    }

    login(privateKey) {
        let giveawayPublicKey = '0xD6Fd1FbDD8cF94b596Ef13cE8FeE21b52314D32A';
        console.info(web3)
        let account = web3.eth.accounts.privateKeyToAccount(privateKey);
        if (account.address.toLowerCase() !== giveawayPublicKey.toLowerCase())
            return false;

        //login to ctr or something
        return true;
    }

    triggerPayout() {
        //register account
        //get accounts
        //get first account
        //
    }
}


module.exports = new Referral();