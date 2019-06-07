var DbClient = require('../DbClient');
var RoomDao = require('./RoomDao');

class StatisticDao{

    static async insertRecord(roomId, guestId, duration){
        let client = await DbClient.getClient();
        try {
            await client.query(`INSERT INTO speech_statistic (room_id, guest_id, duration) VALUES ('${roomId}','${guestId}', '${duration}')`);
        } catch (e) {
            console.log(e);
            return false;
        } finally {
            client.end();
        }
    }

    static async getRoomStatistic(roomId){
        let client = await DbClient.getClient();
        try {
            let room = await RoomDao.getRoomById(roomId);

            let guests = await RoomDao.getAllParticipants(roomId);

            let guest_dict = {};

            for (let i in guests){
                let guest = guests[i];
                guest_dict[guest._uuid] = guest;
            }

            let {rows} = await client.query(`SELECT * FROM speech_statistic WHERE room_id = '${roomId}'`);

            let csv = [];
            let header = ["Name","Rededauer"];

            let offset = header.length;

            let attributeIdxDict = {};

            for (let i in room._attributes){
                attributeIdxDict[room._attributes[i]._name] = offset + i;
                header.push(room._attributes[i]._name);
            }

            csv.push(header);

            for (let i in rows){
                let row = rows[i];
                let line = [];

                let guest = guest_dict[row.guest_id];

                line.push(guest._name);
                line.push(row.duration);

                for (let a in guest._attributes){
                    let idx = attributeIdxDict[guest._attributes._name];
                    line[idx] = guest._attributes._values[0];
                }

                csv.push(line);
            }

            return csv;

        } catch (e) {
            console.log(e);
            return false;
        } finally {
            client.end();
        }
    }

}

module.exports = StatisticDao;