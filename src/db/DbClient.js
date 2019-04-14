const { Client } = require('pg/lib');

var client_instance = null;

class DbClient {

    static connect(){

        let db_client = client_instance = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });

        db_client.connect();

        return db_client;

    }

}

module.exports = DbClient;