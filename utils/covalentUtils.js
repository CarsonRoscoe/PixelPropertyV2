const Axios = require('axios');

const CovalentAPI = {
    Transactions : 'transactions_v2',
    Events : 'events'
}


function createURL(chainId, apiCallName, mandatoryArgs, optionalArgs) {
    let result =  'https://api.covalenthq.com/v1/' + chainId + '/' + apiCallName + '/';
    if (mandatoryArgs != null) {
        let keys = Object.keys(mandatoryArgs);
        if (keys.length > 0) {
            for(let i = 0; i < keys.length; ++i) {
                let key = keys[i];
                let value = mandatoryArgs[key];
                result += key + '/' + value + '/';
            }
            result += '?';
        }
        else {
            result += '?';
        }
    } else {
        result += '?';
    }
    if (optionalArgs != null) {
        let keys = Object.keys(optionalArgs);
        if (keys.length > 0) {
            for(let i = 0; i < keys.length; ++i) {
                let key = keys[i];
                let value = optionalArgs[key];
                result += key + '=' + value;
                if (i < keys.length - 1) {
                    result += '&';
                }
            }
        }
    }

    result += '&key=ckey_9940773fce9c4d718d032512e5b';
    return result;
}

function createCovalentRequest(chainId, apiCallName, args, successCallback, failCallback) {
    if (args == null) {
        args = {};
    }

    let promise = Axios({
        method: 'GET',
        url: createURL(chainId, apiCallName, args.mandatoryArgs, args.optionalArgs),
    });
    if (successCallback != null) {
        promise.then(successCallback);
    }
    if (failCallback != null) {
        promise.catch(failCallback);
    }
    promise.then(successCallback).catch(failCallback);
    return promise;
}

const getContractEventsAsync = (chainId, contractAddress, startingBlock, endingBlock, pageNumber, pageSize, successCallback, failCallback ) => {
    return createCovalentRequest(chainId, CovalentAPI.Events, { 
        mandatoryArgs : {
            address : contractAddress
        },
        optionalArgs : {
            'starting-block' : startingBlock,
            'ending-block' : endingBlock,
            'page-number' : pageNumber,
            'page-size' : pageSize
        }
    }, successCallback, failCallback);   
};


const getAllContractEventsAsync = async (dapp, successCallback) => {
    let chainId = dapp.chainId;

    let result = [];
    let lastPromise = null;

    let pageNumber = 0;
    let pageSize = 1000;

    let startingBlock = dapp.oldest_block;
    let currentBlock = startingBlock + pageSize; 

    do {
        lastPromise = getContractEventsAsync(chainId, dapp.address, startingBlock, currentBlock, pageNumber, pageSize );
        lastPromise.then((ev) => {
            console.info('Fetched' + startingBlock + ' to ' + currentBlock);
            if (ev != null && ev.data != null && ev.data.data != null && ev.data.data.items != null) {
                for(let i = 0; i < ev.data.data.items.length; ++i) {
                    result.push(ev.data.data.items[i]);
                }
                startingBlock += pageSize;
                currentBlock += pageSize;
                
                if (startingBlock > dapp.latest_block) {
                    lastPromise = null;
                }
                else if (currentBlock > dapp.latest_block) {
                    currentBlock = dapp.latest_block;
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

    successCallback(result);
}

module.exports = {
    getContractEventsAsync,
    getAllContractEventsAsync,
};