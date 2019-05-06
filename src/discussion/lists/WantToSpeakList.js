const SpeechContribution = require('../models/SpeechContribution');
const Util = require('../Util');

const MESSAGE_KEY = 'wantToSpeakList';

class WantToSpeakList {

    constructor(){
        this._list = [];
    }

    add(id, type){
        if (isNaN(type)) return;

        let filteredWantToSpeakList = this._list.filter(function (speechContribution) {
            return id === speechContribution.id;
        });

        if (filteredWantToSpeakList.length === 0){
            this._list.push(new SpeechContribution(id,type));
        }
    }

    remove(id){
        if (isNaN(id)) return;

        for(let i = 0; i < this._list.length; i++) {
            let speechContribution = this._list[i];

            if (speechContribution.id === id) {
                this._list.splice(i, 1);
                i--;
            }
        }
    }

    contains(id){
        if (isNaN(id)) return false;

        let filteredWantToSpeakList = this._list.filter(function (speechContribution) {
            return id === speechContribution.id;
        });

        if (filteredWantToSpeakList.length === 0) return false;

        return filteredWantToSpeakList[0];
    }

    toMessage(){
        return Util.wrapResponse(MESSAGE_KEY, SpeechContribution.listToJson(this._list));
    }
}

module.exports = WantToSpeakList;