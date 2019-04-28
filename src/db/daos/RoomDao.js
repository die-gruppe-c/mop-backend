var DbClient = require('../DbClient');
var Room = require('../models/Room');
var Attribute = require('../models/Attribute');
var AttributeValue = require('../models/AttributeValue');


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

            const { rows } = await client.query('SELECT * FROM room WHERE id = $1',[id]);
            let roomRows = rows;

            let room;

            if (roomRows && roomRows.length > 0){
                let rawRoom = roomRows[0];
                room = new Room(rawRoom.id, rawRoom.name, rawRoom.owner, rawRoom.created_on, rawRoom.archived, rawRoom.running);

                const { rows } = await client.query(`SELECT * FROM room_attribute WHERE room_id = '${id}'`);
                let attributeRows = rows;

                for (let i in attributeRows){
                    let attribute = new Attribute(attributeRows[i].name);

                    const { rows } = await client.query(`SELECT * FROM room_attribute_value WHERE room_id = '${id}' AND attribute_name = '${attribute._name}'`);
                    let attributeValueRows = rows;

                    for (let a in attributeValueRows){
                        let value = new AttributeValue(attributeValueRows[a].name, attributeValueRows[a].color, attributeValueRows[a].weight);
                        attribute._values.push(value);
                    }
                    room._attributes.push(attribute);
                }
            }

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
            return rooms;
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

    static async isInActiveRoom(uuid){
        let client = await DbClient.getClient();
        try {

            const rooms = await this.getRoomsParticipated(uuid);

            for (let i in rooms){
                if (!rooms[i]._archived) return rooms[i];
            }

            const roomsAsOwner = await this.getRoomsOfOwner(uuid);

            for (let i in roomsAsOwner){
                if (!roomsAsOwner[i]._archived) return roomsAsOwner[i];
            }

            return false;
        } catch (e) {
            console.log(e);
            return false;
        } finally {
            client.end();
        }
    }

}

module.exports = RoomDao;