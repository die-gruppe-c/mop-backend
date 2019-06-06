class StatisticRecord {

    constructor(attr_values){
        this._values = {};

        for (let i in attr_values){
            this._values[attr_values[i]._name] = 0;
        }
    }

    addTimeForValue(value, duration){
        this._values[value] += duration;
    }

    _getTotalDuration(){
        let total = 0;
        for (let i in this._values){
            total += this._values[i];
        }
        return total;
    }

    toJson(){
        let json = {};

        let total = this._getTotalDuration();

        for (let i in this._values){
            json[i] = total === 0 ? 0 : Math.floor((this._values[i] / total) * 100);
        }

        return {
            total: total,
            values: json
        }
    }

}

module.exports = StatisticRecord;