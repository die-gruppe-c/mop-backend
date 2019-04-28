const { Client } = require('pg/lib');


class DbClient {

    static async getClient(){

        let db_client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });

        await db_client.connect();

        return db_client;

    }

}

module.exports = DbClient;