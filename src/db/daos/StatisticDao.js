var DbClient = require('../DbClient');

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

}

module.exports = StatisticDao;