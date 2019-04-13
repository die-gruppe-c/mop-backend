const { Client } = require('pg/lib');
var User = require('../models/Moderator');

class ModeratorDao {

    constructor() {

        this.db_client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });

    }

    createModerator(user, callback){
        this.db_client.connect();
        this.db_client.query( `INSERT INTO moderator_user (email, password) VALUES ('${user.get_email()}','${user.get_password()}')`,
            (err, res) => {
            if (err) throw err;
            this.db_client.end();
            callback(res);
        });
    }

    getModByEMail(email, callback){
        this.db_client.connect();
        this.db_client.query(`SELECT * FROM moderator_user WHERE email = '${email}'`, (err, res) => {
            if (err) throw err;
            this.db_client.end();
            let user;
            if (res.rows.length > 0) user = new User(res.rows[0].id, res.rows[0].email, res.rows[0].password);
            callback(user);
        });
    }

    getModById(id, callback){
        this.db_client.connect();
        this.db_client.query(`SELECT * FROM moderator_user WHERE id = '${id}'`, (err, res) => {
            if (err) throw err;
            this.db_client.end();
            let user;
            if (res.rows.length > 0) user = new User(res.rows[0].id, res.rows[0].email, res.rows[0].password);
            callback(user);
        });
    }

}

module.exports = ModeratorDao;