var DbClient = require('../DbClient');
var Room = require('../models/Room');

class RoomDao extends DbClient{

    static insertRoom(room, callback){
        let db_client = this.connect();
        db_client.query( `INSERT INTO room (name, owner, created_on) VALUES ('${room._name}', '${room._owner}', to_timestamp(${Date.now()} / 1000.0))`,
            (err, res) => {
            if (err) throw err;
            db_client.end();
            callback(res);
        });
    }

    static getRoomById(id, callback){
        let db_client = this.connect();
        db_client.query(`SELECT * FROM room WHERE id = '${id}'`, (err, res) => {
            if (err) throw err;
            db_client.end();
            let room;
            if (res.rows.length > 0) room = new Room(res.rows[0].id, res.rows[0].name, res.rows[0].owner, res.rows[0].created_on);
            callback(room);
        });
    }

    static insertParticipant(guest, room, callback){
        let db_client = this.connect();
        db_client.query( `INSERT INTO room_participant (room_id, guest_id, guest_name) VALUES ('${room._id}', '${guest._uuid}', '${guest._name}')`,
            (err, res) => {
                if (err) throw err;
                db_client.end();
                callback(res);
            });
    }

}

module.exports = RoomDao;