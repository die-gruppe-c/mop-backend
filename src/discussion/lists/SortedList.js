const Util = require('../util/Util');

const MESSAGE_KEY = 'sortedList';


class SortedList {

    constructor(){
        this._list = [];
        this._participants = [];
        this.onStatisticChange = this.onStatisticChange.bind(this);
    }

    setParticipants(participants){
        this._participants = participants;
        this.sortAlphabetically();
    }

    sortAlphabetically(){
        this._participants.sort(function (a,b) {
            a = a._name.toUpperCase();
            b = b._name.toUpperCase();
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        });

        this._updateListFromParticipants()
    }

    _updateListFromParticipants(){
        this._list = [];

        for (let i in this._participants) {
            if (!this._participants.hasOwnProperty(i)) continue;
            this._list.push(this._participants[i]._frontendId);
        }
    }


    onStatisticChange(statistic){
        //statistic = { attr1: { wert1: 20, wert2: 80 } }


        this._participants.sort( function (a, b) {
            let aScore = 0;

            for (let i in a._attributes){
                aScore += +statistic[a._attributes[i]._name][a._attributes[i]._values[0]._name];
            }

            let bScore = 0;

            for (let i in b._attributes){
                bScore += +statistic[b._attributes[i]._name][b._attributes[i]._values[0]._name];
            }

            if (aScore < bScore) {
                return -1;
            }
            if (aScore > bScore) {
                return 1;
            }
            return 0;
        });

        this._updateListFromParticipants();
    }


    toMessage(){
        return Util.wrapResponse(MESSAGE_KEY, this._list);
    }

}

module.exports = SortedList;