const covalentUtils = require('./covalentUtils');
// const fileUtils = require('./fileUtils');
const dbUtils = require('./dbUtils');

const ensureEventHistoryIsUpToDate = (dappDef, successCallback) => {
    // fileUtils.ensureContractHistoryFileExists(dappDef.chainId, dappDef.address);
    dbUtils.getLastBlockNumber(dappDef.chainId, 'PropertyColorUpdate', async (lastBlockNumber) => {
        let blockFetchSize = 1000;
        let pageSize = 100;
        let pageNumber = 0;

        let startingBlock = lastBlockNumber == null ? dappDef.oldest_block: lastBlockNumber;
        let currentBlock = startingBlock + blockFetchSize; 

        do {
            lastPromise = covalentUtils.getContractEventsAsync(dappDef.chainId, dappDef.address, startingBlock, currentBlock, pageNumber, pageSize );
            lastPromise.then((ev) => {
                console.info('Fetched' + startingBlock + ' to ' + currentBlock);
                if (ev != null && ev.data != null && ev.data.data != null && ev.data.data.items != null) {
                    dbUtils.insertEvents(dappDef, ev.data.data.items);
                    startingBlock += blockFetchSize;
                    currentBlock += blockFetchSize;
                    
                    if (startingBlock > dappDef.latest_block) {
                        lastPromise = null;
                    }
                    else if (currentBlock > dappDef.latest_block) {
                        currentBlock = dappDef.latest_block;
                    }

                }
                else {
                    lastPromise = null;
                }
            })
            lastPromise.catch((ev) => {
                lastPromise = null;
                console.info('Error', ev);
            });
            await lastPromise;
        } while(lastPromise != null);

        if (currentBlock >= dappDef.latest_block) {
            successCallback();
        }
    }, dappDef.oldest_block );
}



module.exports = {
    ensureEventHistoryIsUpToDate,
};