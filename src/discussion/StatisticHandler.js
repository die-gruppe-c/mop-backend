const StatisticDao = require('../db/daos/StatisticDao');
const StatisticRecord = require('./models/StatisticRecord');
const Util = require('./util/Util');

const MESSAGE_KEY = 'speechStatistics';

class StatisticHandler {

    constructor(room){
        this._attributeStatistics = {};

        for (let i in room._attributes){
            this._attributeStatistics[room._attributes[i]._name] = new StatisticRecord(room._attributes[i]._values);
        }
    }

    addRecord(guest, duration, speechType){
        if (duration === 0) return;

        StatisticDao.insertRecord(guest._roomId, guest._uuid, duration, speechType);

        for (let i in guest._attributes){
            if (this._attributeStatistics[guest._attributes[i]._name] !== null){
                this._attributeStatistics[guest._attributes[i]._name]
                    .addTimeForValue(guest._attributes[i]._values[0]._name,duration);
            }
        }

        this._notifyChangeListener();

    }

    setOnStatisticChangeListener(statisticChangeListener){
        this._statisticChangeListener = statisticChangeListener;
    }

    _notifyChangeListener(){

        if (!this._statisticChangeListener) return;

        let statistic = {};

        for (let i in this._attributeStatistics){
            statistic[i] = this._attributeStatistics[i].getAllPercentages();
        }

        this._statisticChangeListener(statistic);

    }

    toMessage(current_speaker, current_duration){
        let json = {};

        for (let i in this._attributeStatistics){

            let current_speaker_value = false;
            
            if (current_speaker){
                current_speaker_value = current_speaker.getValueForAttribute(i);
            }
            
            if (!current_speaker_value) {
                json[i] = this._attributeStatistics[i].toJson();
            }else{
                json[i] = this._attributeStatistics[i].toJson(current_speaker_value._name, current_duration);
            }
        }

        return Util.wrapResponse(MESSAGE_KEY, json);
    }

}

module.exports = StatisticHandler;