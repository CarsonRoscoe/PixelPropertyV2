const sqlite3 = require('sqlite3');
const fs = require('fs');
const sql = require('./sqlUtils');
const eventUtils = require('./eventUtils');
const dbFilePath = './blockchains.db';

let sqlDb = null;


// If the database does not exist, create it, otherwise, open a connection
try {
    if (fs.existsSync(dbFilePath)) {
        sqlDb = new sqlite3.Database(dbFilePath, (evv, a) => {
            if (evv == null && a == null) {
                // Database setup
            }
            else {
                console.info('File exists callback', evv, a);
            }
        });
        
    }
    else {
        sqlDb = new sqlite3.Database(dbFilePath);
        sqlDb.serialize(function() {
            sqlDb.run( sql.Create.PropertyColorUpdate);
            sqlDb.run( sql.Create.PropertyBought);
            sqlDb.run( sql.Create.DefaultEvent);
          });
          
    }
} catch(err) {
    console.error(err)
}

// foreach DApp, check if a table exists for each of their events
    // if not, create the table

const dbConnection = sqlDb;

module.exports = {
    beginWriting : () => {
    },
    endWriting : () => {

    },
    getLastBlockNumber : (chainId, eventName, callback, def) => {
        console.info('dbUtils.getLastBlockNumber');
        let rawSql = sql.MaxBlock(eventName, chainId);
        sqlDb.all(rawSql, function(err, rows) {
            if (err != null || rows[0] == null || rows[0]['MAX(blockNumber)'] == null) {
                callback(def);
            }
            else {
                callback(rows[0]['MAX(blockNumber)']);
            }
        });
    },
    insertEvents : (dapp, events) => {
        console.info('dbUtils.insertEvents');
        let resultEvents = {};

        for(let i = 0; i < events.length; ++i) {
            let event = eventUtils.rawEventToEvent(dapp.chainId, dapp.abi, events[i]);
            if (event != null) {
                if (resultEvents[event.name] == null) {
                    resultEvents[event.name] = [];
                }
                resultEvents[event.name].push(event);
            }
        }

        let eventNames = Object.keys(resultEvents);
        if (eventNames.length > 0) {
            for(let i = 0; i < eventNames.length; ++i) {
                let eventName = eventNames[i];
                let parsedEvents = resultEvents[eventName];
                if (sql.Insert[eventName] != null) {
                    let rawSql = sql.Insert[eventName](parsedEvents);
                    sqlDb.all(rawSql, (err, rows) => {
                        console.info('Inserter event', eventName, err, rows);
                    } );
                }
                else {
                    console.info(eventName + ' is not a event sql.Insert recognizes');
                }
            }
        }
    },
    getEvents : (dapp, event) => {

    }
}