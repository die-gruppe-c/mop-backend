var User = require('../models/Moderator');
var DbClient = require('../DbClient');

class ModeratorDao extends DbClient{

    static createModerator(user, callback){
        let db_client = this.connect();
        db_client.query( `INSERT INTO moderator_user (email, password) VALUES ('${user._email}','${user._password}')`,
            (err, res) => {
            if (err) throw err;
            db_client.end();
            callback(res);
        });
    }

    static getModByEMail(email, callback){
        let db_client = this.connect();
        db_client.query(`SELECT * FROM moderator_user WHERE email = '${email}'`, (err, res) => {
            if (err) throw err;
            db_client.end();
            let user;
            if (res.rows.length > 0) user = new User(res.rows[0].id, res.rows[0].email, res.rows[0].password);
            callback(user);
        });
    }

    static getModById(id, callback){
        let db_client = this.connect();
        db_client.query(`SELECT * FROM moderator_user WHERE id = '${id}'`, (err, res) => {
            if (err) throw err;
            db_client.end();
            let user;
            if (res.rows.length > 0) user = new User(res.rows[0].id, res.rows[0].email, res.rows[0].password);
            callback(user);
        });
    }

}

module.exports = ModeratorDao;