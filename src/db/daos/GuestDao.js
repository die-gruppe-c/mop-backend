var DbClient = require('../DbClient');

class GuestDao extends DbClient{

    static insertGuestToken(guest, callback){
        let db_client = this.connect();
        db_client.query( `INSERT INTO guest (uuid) VALUES ('${guest._uuid}')`,
            (err, res) => {
            if (err) throw err;
            db_client.disconnect();
            callback(res);
        });
    }

    static exists(guest, callback){
        let db_client = this.connect();
        db_client.query(`SELECT * FROM guest WHERE uuid = '${guest._uuid}'`, (err, res) => {
            if (err) throw err;
            db_client.end();
            let guest_exists;
            if (res.rows.length > 0)  guest_exists = true;
            callback(guest_exists);
        });
    }

}

module.exports = GuestDao;