var DbClient = require('../DbClient');
var RoomDao = require('./RoomDao');
const { Parser } = require('json2csv');

class StatisticDao{

    static async insertRecord(roomId, guestId, duration, speechType){
        let client = await DbClient.getClient();
        try {
            await client.query(`INSERT INTO speech_statistic (room_id, guest_id, duration, speech_type) VALUES ('${roomId}','${guestId}', '${duration}', '${speechType}')`);
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

            let header = [{
                label: 'Name',
                value: 'name'
            },{
                label: 'Rededauer in ms',
                value: 'duration'
            },{
                label: 'Beitragstyp',
                value: 'type'
            }];

            for (let i in room._attributes){
                let line = {};
                line["label"] = room._attributes[i]._name;
                line["value"] = room._attributes[i]._name;
                header.push(line);
            }


            let values = [];


            for (let i in rows){
                let row = rows[i];
                let line = {};

                let guest = guest_dict[row.guest_id];

                line["name"] = guest._name;
                line["duration"] = row.duration;
                line["type"] = row.speech_type;

                for (let a in guest._attributes){
                    line[guest._attributes[a]._name] = guest._attributes[a]._values[0]._name;
                }

                values.push(line);
            }

            const json2csvParser = new Parser({ fields: header, quote: '' });

            return  json2csvParser.parse(values);

        } catch (e) {
            console.log(e);
            return false;
        } finally {
            client.end();
        }
    }

}

module.exports = StatisticDao;