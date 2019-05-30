var DbClient = require('../DbClient');
var Room = require('../entities/Room');
var Guest = require('../entities/Guest');
var Attribute = require('../entities/Attribute');
var AttributeValue = require('../entities/AttributeValue');


class RoomDao{

    static async insertRoom(room) {

        let client = await DbClient.getClient();
        try {
            await client.query('BEGIN');
            await client.query(`INSERT INTO room (id, name, owner, created_on, archived, running) VALUES ('${room._id}', '${room._name}', '${room._owner}', to_timestamp(${Date.now()} / 1000.0), FALSE, FALSE)`);

            for (let i = 0; i < room._attributes.length; i++) {
                let newAttr = room._attributes[i];
                await client.query(`INSERT INTO room_attribute (name, room_id) VALUES ('${newAttr._name}','${room._id}')`);

                for (let a = 0; a < newAttr._values.length; a++) {
                    let value = newAttr._values[a];
                    await client.query( `INSERT INTO room_attribute_value (name, attribute_name, room_id, color, weight) VALUES ('${value._name}','${newAttr._name}','${room._id}','${value._color}','${value._weight}')`);
                }
            }
            await client.query('COMMIT');
            return true;
        } catch (e) {
            await client.query('ROLLBACK');
            console.log(e);
            return false;
        } finally {
            client.end();
        }

    }

    static async getRoomById(id){

        let client = await DbClient.getClient();
        try {

            const { rows } = await client.query('SELECT room.id, room.name, room.owner, room.created_on, room.archived, ' +
                'room.running, room_attribute.name AS attribute_name, room_attribute_value.name AS value_name , ' +
                'room_attribute_value.color, room_attribute_value.weight FROM room ' +
                'INNER JOIN room_attribute ON room.id = room_attribute.room_id ' +
                'INNER JOIN room_attribute_value ON room.id = room_attribute_value.room_id AND room_attribute.name = room_attribute_value.attribute_name ' +
                'WHERE room.id = $1 ' +
                'ORDER BY room.id, room_attribute.name',[id]);

            if (rows.length === 0) return;

            let room = new Room(rows[0].id, rows[0].name, rows[0].owner, rows[0].created_on, rows[0].archived, rows[0].running);

            console.log(rows);

            let cur_attribute;
            for (let i in rows){
                if (!rows.hasOwnProperty(i)) continue;
                let row = rows[i];
                if (!cur_attribute || cur_attribute._name !== row.attribute_name){
                    if (cur_attribute) room._attributes.push(cur_attribute);
                    cur_attribute = new Attribute(row.attribute_name);
                }
                cur_attribute._values.push(new AttributeValue(row.value_name, row.color, row.weight));
            }
            room._attributes.push(cur_attribute);

            return room;
        } catch (e) {
            console.log(e);
            return false;
        } finally {
            client.end();
        }

    }

    static async getRoomsOfOwner(uuid){

        let client = await DbClient.getClient();
        try {

            let rooms = [];

            const { rows } = await client.query('SELECT * FROM room WHERE owner = $1',[uuid]);
            let roomRows = rows;

            for (let r in roomRows) {

                let rawRoom = roomRows[r];
                let room = new Room(rawRoom.id, rawRoom.name, rawRoom.owner, rawRoom.created_on, rawRoom.archived, rawRoom.running);

                const {rows} = await client.query(`SELECT * FROM room_attribute WHERE room_id = '${room._id}'`);
                let attributeRows = rows;

                for (let i in attributeRows) {
                    let attribute = new Attribute(attributeRows[i].name);

                    const {rows} = await client.query(`SELECT * FROM room_attribute_value WHERE room_id = '${room._id}' AND attribute_name = '${attribute._name}'`);
                    let attributeValueRows = rows;

                    for (let a in attributeValueRows) {
                        let value = new AttributeValue(attributeValueRows[a].name, attributeValueRows[a].color, attributeValueRows[a].weight);
                        attribute._values.push(value);
                    }
                    room._attributes.push(attribute);
                }

                rooms.push(room);
            }

            return rooms;
        } catch (e) {
            console.log(e);
            return false;
        } finally {
            client.end();
        }

    }

    static async getRoomsParticipated(uuid){

        let client = await DbClient.getClient();
        try {

            let rooms = [];

            const { rows } = await client.query('SELECT * FROM room_participant WHERE guest_id = $1',[uuid]);
            let roomParticipatedRows = rows;

            for (let i in roomParticipatedRows) {
                const room = await this.getRoomById(roomParticipatedRows[i].room_id);
                rooms.push(room);
            }

            return rooms;
        } catch (e) {
            console.log(e);
            return false;
        } finally {
            client.end();
        }

    }

    static async insertParticipant(guest){

        let client = await DbClient.getClient();
        try {
            await client.query('BEGIN');

            await client.query(`INSERT INTO room_participant (room_id, guest_id, guest_name, created_by_owner) VALUES ('${guest._roomId}','${guest._uuid}', '${guest._name}', '${guest._createdByOwner}')`);

            for(let i = 0; i < guest._attributes.length; i++){
                let value = guest._attributes[i]._values[0]._name;
                await client.query(`INSERT INTO room_participant_attribute (room_id ,guest_id ,attribute, attribute_value) VALUES ('${guest._roomId}','${guest._uuid}', '${guest._attributes[i]._name}', '${value}')`);
            }

            await client.query('COMMIT');
            return true;
        } catch (e) {
            await client.query('ROLLBACK');
            console.log(e);
            return false;
        } finally {
            client.end();
        }
    }

    static async deleteParticipant(uuid, roomId){
        let client = await DbClient.getClient();

        try {

            await client.query('DELETE FROM room_participant WHERE guest_id = $1 AND room_id = $2',[uuid, roomId]);

            return true;

        } catch (e) {
            console.log(e);
            return false;
        } finally {
            client.end();
        }
    }

    static async getParticipant(uuid, roomId){
        let client = await DbClient.getClient();
        try {

            let { rows } = await client.query('SELECT * FROM room_participant WHERE guest_id = $1 AND room_id = $2',[uuid, roomId]);
            let participantRows = rows;

            if (participantRows.length === 0) return false;

            let guest = new Guest(participantRows[0].room_id, participantRows[0].guest_id, participantRows[0].guest_name, participantRows[0].created_by_owner);

            rows = await client.query('SELECT * FROM room_participant_attribute WHERE room_id = $1 AND guest_id = $2', [roomId, uuid]);
            let attributeRows = rows.rows;

            for (let i in attributeRows){
                let attribute;

                for (let l in guest._attributes) {
                    if (guest._attributes[l]._name === attributeRows[i].attribute) attribute = guest._attributes[l];
                }

                if (!attribute){
                    attribute = new Attribute(attributeRows[i].attribute);
                    guest._attributes.push(attribute);
                }

                let {rows} = await client.query('SELECT * FROM room_attribute_value WHERE name = $1 AND attribute_name = $2 AND room_id = $3',
                    [attributeRows[i].attribute_value,attribute._name, guest._roomId]);
                let attributeValueRows = rows;

                if (attributeValueRows.length === 0) continue;

                attribute._values.push(new AttributeValue(attributeRows[i].attribute_value, attributeValueRows[0].color, attributeValueRows[0].weight));
            }

            return guest;

        } catch (e) {
            console.log(e);
            return false;
        } finally {
            client.end();
        }
    }

    static async getAllParticipants(roomId){
        let client = await DbClient.getClient();
        try {

            let guests = [];

            let { rows } = await client.query('SELECT * FROM room_participant WHERE room_id = $1',[roomId]);
            let participantRows = rows;

            for (let a in participantRows) {

                let guest = new Guest(participantRows[a].room_id, participantRows[a].guest_id, participantRows[a].guest_name, participantRows[a].created_by_owner);

                let { rows } = await client.query('SELECT * FROM room_participant_attribute WHERE room_id = $1 AND guest_id = $2', [roomId, guest._uuid]);
                let attributeRows = rows;

                for (let i in attributeRows) {
                    let attribute;

                    for (let l in guest._attributes) {
                        if (guest._attributes[l]._name === attributeRows[i].attribute) attribute = guest._attributes[l];
                    }

                    if (!attribute) {
                        attribute = new Attribute(attributeRows[i].attribute);
                        guest._attributes.push(attribute);
                    }

                    let {rows} = await client.query('SELECT * FROM room_attribute_value WHERE name = $1 AND attribute_name = $2 AND room_id = $3',
                        [attributeRows[i].attribute_value, attribute._name, guest._roomId]);
                    let attributeValueRows = rows;

                    if (attributeValueRows.length === 0) continue;

                    attribute._values.push(new AttributeValue(attributeRows[i].attribute_value, attributeValueRows[0].color, attributeValueRows[0].weight));
                }

                guests.push(guest);
            }

            return guests;

        } catch (e) {
            console.log(e);
            return false;
        } finally {
            client.end();
        }
    }

    static async isInActiveRoom(uuid){
        let client = await DbClient.getClient();
        try {

            const rooms = await this.getRoomsParticipated(uuid);

            for (let i in rooms){
                if (!rooms[i]._archived) return rooms[i];
            }

            const roomsAsOwner = await this.getRoomsOfOwner(uuid);

            for (let a in roomsAsOwner){
                if (!roomsAsOwner[a]._archived) return roomsAsOwner[a];
            }

            return false;
        } catch (e) {
            console.log(e);
            return false;
        } finally {
            client.end();
        }
    }

    static async updateRoomRunning(roomId, running) {
        let client = await DbClient.getClient();
        try {
            await client.query('UPDATE room SET running = $1 WHERE id = $2', [running, roomId]);
        } catch (e) {
            console.log(e);
            return false;
        } finally {
            client.end();
        }
    }
}

module.exports = RoomDao;