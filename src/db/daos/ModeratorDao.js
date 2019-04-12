const { Client } = require('pg/lib');
var User = require('../models/Moderator');

class ModeratorDao {

    constructor() {

        this.db_client = new Client({
            connectionString: 'postgres://ymbogxpnnlomqc:8bec2555d7329bae017d9dc884f17e491c9bbbd5455cc36eef1bc11f31110bf0@ec2-54-228-243-238.eu-west-1.compute.amazonaws.com:5432/d7nu384eg44a02',//process.env.DATABASE_URL,
            ssl: true,
        });

        this.db_client.connect();

    }

    createModerator(user, callback){
        this.db_client.query( `INSERT INTO moderator_user (email, password) VALUES ('${user.get_email()}','${user.get_password()}')`,
            (err, res) => {
            if (err) throw err;
            callback(res);
        });
    }

    getModByEMail(email, callback){
        this.db_client.query(`SELECT * FROM moderator_user WHERE email = '${email}'`, (err, res) => {
            if (err) throw err;
            let user;
            if (res.rows.length > 0) user = new User(res.rows[0].id, res.rows[0].email, res.rows[0].password);
            callback(user);
        });
    }

    getModById(id, callback){
        this.db_client.query(`SELECT * FROM moderator_user WHERE id = '${id}'`, (err, res) => {
            if (err) throw err;
            let user;
            if (res.rows.length > 0) user = new User(res.rows[0].id, res.rows[0].email, res.rows[0].password);
            callback(user);
        });
    }

}

module.exports = ModeratorDao;