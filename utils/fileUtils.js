
const fs = require('fs');
const readline = require('readline');
const readLastLines = require('read-last-lines');
const { rawEventToEvent } = require('./eventUtils');

const createContractHistoryFileName = (chainId, contractAddress) => chainId + '_' + contractAddress + '.txt'
const ensureContractHistoryFileExists = (chainId, contractAddress) => {
    let fileName = createContractHistoryFileName(chainId, contractAddress);
    fs.writeFile(fileName, '', { flag: 'wx' }, function (err) {
    });
};
const readFileEventHistory = (chainId, contractAddress) => {
    let fileName = createContractHistoryFileName(chainId, contractAddress);
    var lineReader = readline.createInterface({
        input: fs.createReadStream(fileName)
    });
      
    lineReader.on('line', function (line) {
        console.log('Line from file:', line);
    });
};

const addEventToContractEventHistory = (dappData, rawEvents) => {
    let fileName = createContractHistoryFileName(dappData.chainId, dappData.address);

    for(let i = 0; i < rawEvents.length; ++i) {
        let eventJson = JSON.stringify(rawEventToEvent(dappData.chainId, dappData.abi, rawEvents[i]));
        fs.appendFile(fileName, eventJson + '\n', function (err) {
            if (err) {
                throw err;
            } else {
            }
        })
    }
};

const getLastStoredBlockNumber = (chainId, contractAddress, callback) => {
    let fileName = createContractHistoryFileName(chainId, contractAddress);
    readLastLines.read(fileName, 1, 'utf8')
    .then((line) => {
        if (line.length > 0) {
            let obj = JSON.parse(line);
            callback(obj.blockNumber + 1);
        }
        else {
            callback(null);
        }
    }).catch((e) => {
        console.info('Error', e);
    });
}


module.exports = {
    createContractHistoryFileName,
    ensureContractHistoryFileExists,
    readFileEventHistory,
    addEventToContractEventHistory,
    getLastStoredBlockNumber,
};