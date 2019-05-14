const StatisticRecord = require('./models/StatisticRecord');

class StatisticHandler {

    constructor(){
        this._records = [];
    }

    addRecord(guest, type, duration){
        this._records.push(new StatisticRecord(guest, type, duration));
    }

}

module.exports = StatisticHandler;