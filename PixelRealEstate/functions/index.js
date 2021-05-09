const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.onReferral = functions.database.ref('/Referral/{referrerAddress}/ips/{ip}').onCreate((ev, ctx) => {

    //Base PXL reward
    const PXLReward = 10;

    //Every 25 refers the PXL awarded goes up 1.
    const PXLBonusReferCount = 25;

    let updates = {};

    let referrerAddress = ctx.params.referrerAddress;
    let ip = ctx.params.ip;

    let data = ev.val();
    let referreeAddress = data.wallet;

    updates['/Referral/'+referrerAddress+'/ips/'+ip+'/verified'] = true;
    
    return admin.database().ref('/Referral/'+referrerAddress).once('value').then(refStats => {
        let refStatsVal = refStats.val();
        let earned = refStats.hasChild('earned') ? refStatsVal.earned : 0;
        let refers = refStats.hasChild('refers') ? refStatsVal.refers : 0;
        return admin.database().ref('/Referrees/ips/'+ip).once('value').then(result => {
            if (!result.exists()) {
                updates['/Referral/'+referrerAddress+'/earned'] = earned + PXLReward + Math.floor((refers + 1) / PXLBonusReferCount);
                updates['/Referral/'+referrerAddress+'/refers'] = refers + 1;
                updates['/Referrees/ips/'+ip] = referrerAddress;
            } else {
                updates['/Referral/'+referrerAddress+'/ips/'+ip+'/'+referreeAddress+'/verified'] = 'duplicate IP';
            }
            updates['/Referrees/address/'+referreeAddress] = referrerAddress;
            return admin.database().ref().update(updates);
        });
    });
})