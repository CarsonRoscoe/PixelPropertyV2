
const TABLES = {
    PropertyBought : {
        'chainId': 'INTEGER',
        'blockNumber': 'INTEGER',
        'name': 'TEXT',
        'property': 'INTEGER',
        'newAddress': 'TEXT',
        'oldAddress': 'TEXT',
        'ethAmount': 'INTEGER',
        'pxlAmount': 'INTEGER',
        'timestamp': 'TEXT',
    },
    PropertyColorUpdate: {
        'chainId': 'INTEGER',
        'blockNumber': 'INTEGER',
        'name': 'TEXT',
        'property': 'INTEGER',
        'colors': 'TEXT',
        'becomePublic': 'BOOLEAN',
        'lastUpdate': 'TEXT',
        'lastUpdatePayee': 'TEXT',
    },
    DefaultEvent: {
        'chainId': 'INTEGER',
        'blockNumber': 'INTEGER',
        'name': 'TEXT',
    }
}

const CreateTableSQL = (eventName) => {
    let result = 'CREATE TABLE ' + eventName + ' (';
    console.info(result);

    let keys = Object.keys(TABLES[eventName]);
    for(let i = 0; i < keys.length; ++i) {
        result += keys[i] + ' ' + TABLES[eventName][keys[i]];
        if (i < keys.length - 1) {
            result += ', ';
        }
    }
    result += ')';

    return result;
}

const InsertEventsSQL = (eventName, events) => {
    let eventKeys = Object.keys(TABLES[eventName]);

    let result = 'INSERT INTO ' + eventName + '(';
    for(let i = 0; i < eventKeys.length; ++i) {
        let eventKey = eventKeys[i];
        result += eventKey;
        if (i < eventKeys.length - 1) {
            result += ', ';
        }
    }
    result += ') ';

    console.info(result);

    result += 'VALUES ';
    for(let i = 0; i < events.length; ++i) {
        let event = events[i];
        result += '(';
        for(let j = 0; j < eventKeys.length; ++j) {
            let key = eventKeys[j];
            let type = TABLES[eventName][key];
            if (type == 'TEXT') {
                result += '"';
            }
            result += event[key];
            if (type == 'TEXT') {
                result += '"';
            }
            if (j < eventKeys.length - 1) {
                result += ', '
            }
        }
        result += ')';
        if (i < events.length - 1) {
            result += ',';
        }
    }
    return result;
}

const SelectEventsSQL = (eventName, options) => {
    let result = 'SELECT * FROM ' + eventName;
    console.info(result);

    let wheres = [];
    if (options.chainId != null) {
        wheres.push('WHERE chainId = ' + options.chainId);
    }
    if (options.minBlockNumber != null) {
        wheres.push('WHERE blockNumber >= ' + options.minBlockNumber)
    }
    if (options.maxBlockNumber != null) {
        result += 'WHERE blockNumer <= ' + options.maxBlockNumber;
    }
    for(let i = 0; i < wheres.length; ++i) {
        result += ' ';
        if (i > 0) {
            result += ' AND ';
        }
        result += wheres[i];
    }
    return result;
}

const SelectMaxBlockNumber = (eventName, chainId) => {
    let sql = 'SELECT MAX(blockNumber) FROM ' + eventName;
    if (chainId != null) {
        sql += ' WHERE chainId = ' + chainId;
    }
    return sql;
}

module.exports = {
    Create : {
        PropertyBought : CreateTableSQL('PropertyBought'),
        PropertyColorUpdate : CreateTableSQL('PropertyColorUpdate'),
        DefaultEvent : CreateTableSQL('DefaultEvent'),
    },
    Insert : {
        PropertyBought : (events) => InsertEventsSQL('PropertyBought', events),
        PropertyColorUpdate : (events) => InsertEventsSQL('PropertyColorUpdate', events),
        DefaultEvent : (events) => InsertEventsSQL('DefaultEvent', events),
    },
    Select : {
        PropertyBought : (options) => SelectEventsSQL('PropertyBought', options),
        PropertyColorUpdate : (options) => SelectEventsSQL('PropertyColorUpdate', options),
        DefaultEvent : (options) => SelectEventsSQL('DefaultEvent', options),
    },
    MaxBlock : SelectMaxBlockNumber,
}



