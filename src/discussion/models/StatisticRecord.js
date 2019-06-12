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
            total += +this._values[i];
        }
        return total;
    }

    toJson(currentSpeakerValue, currentDuration){
        let json = {};

        let total = this._getTotalDuration();

        if (currentSpeakerValue){
            total += +currentDuration;
        }

        for (let i in this._values){
            let valueDuration = this._values[i];
            if (currentSpeakerValue && currentSpeakerValue === i) valueDuration += +currentDuration;
            json[i] = total === 0 ? 0 : Math.floor((valueDuration / total) * 100);
        }

        return {
            total: total,
            values: json
        }
    }

}

module.exports = StatisticRecord;