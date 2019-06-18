class StatisticRecord {

    constructor(attr_values){
        this._valueDurations = {};
        this._valueWeights = {};
        this._hasWeights = false;

        for (let i in attr_values){
            this._valueDurations[attr_values[i]._name] = 0;
            this._valueWeights[attr_values[i]._name] = attr_values[i]._weight;
            if (attr_values[i]._weight !== 0) this._hasWeights = true;
        }
    }

    addTimeForValue(value, duration){
        this._valueDurations[value] += +(this._hasWeights ? duration * this._valueWeights[value] : duration);
    }

    _getTotalDuration(){
        let total = 0;
        for (let i in this._valueDurations){
            total += +this._valueDurations[i];
        }
        return total;
    }

    _getValuePercentage(value,currentSpeakerValue, currentDuration){
        let total = this._getTotalDuration();
        let valueDuration = this._valueDurations[value];

        if (currentSpeakerValue && currentDuration){
            currentDuration = this._hasWeights ? currentDuration * this._valueWeights[value] : currentDuration;
            total += +currentDuration;
            if (currentSpeakerValue === value) valueDuration += currentDuration;
        }
        return total === 0 ? 0 : Math.floor((valueDuration / total) * 100);
    }

    getAllPercentages(){
        let allPercentages = {};

        for (let i in this._valueDurations){
            allPercentages[i] = this._getValuePercentage(i);
        }

        return allPercentages;
    }

    toJson(currentSpeakerValue, currentDuration){
        let json = {};

        for (let i in this._valueDurations){

            json[i] = this._getValuePercentage(i,currentSpeakerValue, currentDuration);

        }

        return {
            values: json
        }
    }

}

module.exports = StatisticRecord;