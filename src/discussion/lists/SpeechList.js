const SpeechRequest = require('../models/SpeechRequest');
const Util = require('../util/Util');

const MESSAGE_KEY = 'speechList';


class SpeechList {

    constructor(){
        this._list = [];
    }

    add(id, type){
        if (isNaN(id)) return;
        this._list.push(new SpeechRequest(id, type));
    }

    remove(id){
        let success = false;

        if (isNaN(id)) return success;

        for(let i = 0; i < this._list.length; i++) {
            if (this._list[i].id=== id) {
                this._list.splice(i, 1);
                i--;
                success = true;
            }
        }

        return success;
    }

    removeFirst(){
        return this._list.shift();
    }

    getLength(){
        return this._list.length;
    }

    reorder(id, idx) {
        if (isNaN(id) || isNaN(idx)) return;

        let found = this.remove(id);

        if (found && idx < this._list.length){
            this._list.splice(idx,0,id);
        }
    }

    toMessage(){
        return Util.wrapResponse(MESSAGE_KEY, SpeechRequest.listToJson(this._list));
    }
}

module.exports = SpeechList;