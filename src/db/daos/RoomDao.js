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

            let rooms = this._parseRoomRows(rows);

            if (rooms.length > 0) return rooms[0];
            else return false;

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


            const { rows } = await client.query('SELECT room.id, room.name, room.owner, room.created_on, room.archived, ' +
                'room.running, room_attribute.name AS attribute_name, room_attribute_value.name AS value_name , ' +
                'room_attribute_value.color, room_attribute_value.weight FROM room ' +
                'INNER JOIN room_attribute ON room.id = room_attribute.room_id ' +
                'INNER JOIN room_attribute_value ON room.id = room_attribute_value.room_id AND room_attribute.name = room_attribute_value.attribute_name ' +
                'WHERE room.id = $1 ' +
                'ORDER BY room.owner, room_attribute.name',[uuid]);

            return this._parseRoomRows(rows);

        } catch (e) {
            console.log(e);
            return false;
        } finally {
            client.end();
        }

    }

    static _parseRoomRows(rows){
        let rooms = [];

        if (rows.length === 0) return rooms;

        let cur_room;
        let cur_attribute;
        for (let i in rows){
            if (!rows.hasOwnProperty(i)) continue;
            let row = rows[i];

            if (!cur_room || cur_room._id !== row.id){
                if (cur_room){
                    if (cur_attribute) cur_room._attributes.push(cur_attribute);
                    rooms.push(cur_room);
                }
                cur_room = new Room(row.id, row.name, row.owner, row.created_on, row.archived, row.running);
            }

            if (!cur_attribute || cur_attribute._name !== row.attribute_name){
                if (cur_attribute) cur_room._attributes.push(cur_attribute);
                cur_attribute = new Attribute(row.attribute_name);
            }
            cur_attribute._values.push(new AttributeValue(row.value_name, row.color, row.weight));
        }
        cur_room._attributes.push(cur_attribute);
        rooms.push(cur_room);

        return rooms;
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

            let { rows } = await client.query('SELECT room_participant.room_id, room_participant.guest_id, room_participant.guest_name, ' +
                'room_participant.created_by_owner, room_participant_attribute.attribute, ' +
                'room_participant_attribute.attribute_value, room_attribute_value.color, ' +
                'room_attribute_value. weight ' +
                'FROM room_participant INNER JOIN room_participant_attribute ON ' +
                'room_participant.room_id = room_participant_attribute.room_id AND ' +
                'room_participant.guest_id = room_participant_attribute.guest_id ' +
                'INNER JOIN room_attribute_value ON ' +
                'room_participant.room_id = room_attribute_value.room_id AND ' +
                'room_participant_attribute.attribute = room_attribute_value.attribute_name AND ' +
                'room_participant_attribute.attribute_value = room_attribute_value.name ' +
                'WHERE room_participant.room_id = $1 AND room_participant.guest_id = $2' +
                'ORDER BY room_participant.guest_id;',[roomId, uuid]);

            let guests = this._parseParticipantRows(rows);

            if (guests.length === 0) return false;

            return guests[0];

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

            let { rows } = await client.query('SELECT room_participant.room_id, room_participant.guest_id, room_participant.guest_name, ' +
                'room_participant.created_by_owner, room_participant_attribute.attribute, ' +
                'room_participant_attribute.attribute_value, room_attribute_value.color, ' +
                'room_attribute_value. weight ' +
                'FROM room_participant INNER JOIN room_participant_attribute ON ' +
                'room_participant.room_id = room_participant_attribute.room_id AND ' +
                'room_participant.guest_id = room_participant_attribute.guest_id ' +
                'INNER JOIN room_attribute_value ON ' +
                'room_participant.room_id = room_attribute_value.room_id AND ' +
                'room_participant_attribute.attribute = room_attribute_value.attribute_name AND ' +
                'room_participant_attribute.attribute_value = room_attribute_value.name ' +
                'WHERE room_participant.room_id = $1 ' +
                'ORDER BY room_participant.guest_id;',[roomId]);

            return this._parseParticipantRows(rows);

        } catch (e) {
            console.log(e);
            return false;
        } finally {
            client.end();
        }
    }

    static _parseParticipantRows(rows){
        let participants = [];

        if (rows.length === 0) return participants;

        let cur_participant;
        let cur_attribute;
        for (let i in rows){
            if (!rows.hasOwnProperty(i)) continue;
            let row = rows[i];

            if (!cur_participant || cur_participant._uuid !== row.guest_id){
                if (cur_participant){
                    if (cur_attribute) cur_participant._attributes.push(cur_attribute);
                    participants.push(cur_participant);
                }
                cur_participant = new Guest(row.room_id, row.guest_id, row.guest_name, row.created_by_owner);
            }

            if (!cur_attribute || cur_attribute._name !== row.attribute){
                if (cur_attribute) cur_participant._attributes.push(cur_attribute);
                cur_attribute = new Attribute(row.attribute);
            }
            cur_attribute._values.push(new AttributeValue(row.attribute_value, row.color, row.weight));
        }
        cur_participant._attributes.push(cur_attribute);
        participants.push(cur_participant);

        return participants;
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