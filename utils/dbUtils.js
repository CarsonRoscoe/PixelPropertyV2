const sqlite3 = require('sqlite3');


const fs = require('fs');

const dbFilePath = './blockchains.db';

let sqlDb = null;

try {
    if (fs.existsSync(dbFilePath)) {
        sqlDb = new sqlite3.Database(dbFilePath, (evv, a) => {
            console.info(evv, a);
        });
        
        sqlDb.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
            console.log(row.id + ": " + row.info);
        });
    }
    else {
        sqlDb = new sqlite3.Database(dbFilePath);
        sqlDb.serialize(function() {
            sqlDb.run("CREATE TABLE lorem (info TEXT)");
          
            var stmt = sqlDb.prepare("INSERT INTO lorem VALUES (?)");
            for (var i = 0; i < 10; i++) {
                stmt.run("Ipsum " + i);
            }
            stmt.finalize();
          
            sqlDb.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
                console.log(row.id + ": " + row.info);
            });
          });
          
          sqlDb.close();
    }
} catch(err) {
    console.error(err)
}

const dbConnection = sqlDb;


module.exports = {
    beginWriting : () => {
    },
    endWriting : () => {

    },
    insertEvent : (event) => {

    }
}