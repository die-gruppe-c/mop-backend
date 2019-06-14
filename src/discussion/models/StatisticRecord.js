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

    _getValuePercentage(value, currentDuration){
        let total = this._getTotalDuration();
        let valueDuration = this._values[value];

        //TODO add value weights to calculation

        if (currentDuration){
            total += +currentDuration;
            valueDuration += currentDuration;
        }
        return total === 0 ? 0 : Math.floor((valueDuration / total) * 100);
    }

    getAllPercentages(){
        let allPercentages = {};

        for (let i in this._values){
            allPercentages[i] = this._getValuePercentage(i);
        }

        return allPercentages;
    }

    toJson(currentSpeakerValue, currentDuration){
        let json = {};

        for (let i in this._values){

            json[i] = this._getValuePercentage(i,
                currentSpeakerValue && currentSpeakerValue === i ? currentDuration : undefined);

        }

        //TODO remove total

        return {
            total: 0,
            values: json
        }
    }

}

module.exports = StatisticRecord;