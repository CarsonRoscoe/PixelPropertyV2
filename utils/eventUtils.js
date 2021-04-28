const ethers = require('ethers');

module.exports = {

    rawEventToEvent : (chainId, abi, rawEvent) =>  {
        let iface = new ethers.utils.Interface(abi);
        let log = iface.parseLog({
            topics: rawEvent.raw_log_topics,
            data:  rawEvent.raw_log_data
        })

        let blockNumber = rawEvent.block_height;
        let name = log.name;

        switch(name) {
            case 'PropertyBought':
                return { chainId, blockNumber, name, property : log.args.property, newAddress : log.args.newAddress, oldAddress : log.args.oldAddress, ethAmount : log.args.ethAmount, pxlAmount : log.args.pxlAmount, timestamp : log.args.timestamp  }
            case 'PropertyColorUpdate':
                return { chainId, blockNumber, name, property : log.args.property, colors : log.args.colors, becomePublic : log.args.becomePublic, lastUpdate : log.args.lastUpdate, lastUpdatePayee : log.args.lastUpdatePayee }
            default:
                return { chainId, blockNumber, name };
        }
    }
};