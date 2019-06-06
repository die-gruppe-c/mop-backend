const StatisticDao = require('../db/daos/StatisticDao');
const StatisticRecord = require('./models/StatisticRecord');
const Util = require('./util/Util');

const MESSAGE_KEY = 'speechStatistics';

class StatisticHandler {

    constructor(room){
        this._attributeStatistics = {};

        for (let i in room._attributes){
            this._attributeStatistics[room._attributes[i]._name] = new StatisticRecord();
        }
    }

    addRecord(guest, duration){
        StatisticDao.insertRecord(guest._roomId, guest._uuid, duration);

        for (let i in guest._attributes){
            if (this._attributeStatistics[guest._attributes[i]._name] !== null){
                this._attributeStatistics[guest._attributes[i]._name]
                    .addTimeForValue(guest._attributes[i]._values[0],duration);
            }
        }

    }

    toMessage(){
        let json = {};

        for (let i in this._attributeStatistics){
            json[i] = this._attributeStatistics[i].toJson();
        }

        return Util.wrapResponse(MESSAGE_KEY, json);
    }

}

module.exports = StatisticHandler;