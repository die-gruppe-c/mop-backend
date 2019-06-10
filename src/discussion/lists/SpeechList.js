const SpeechRequest = require('../models/SpeechRequest');
const Util = require('../util/Util');

const MESSAGE_KEY = 'speechList';


class SpeechList {

    constructor(){
        this._list = [];
    }

    add(id, type){
        if (isNaN(id) || id < 0) return;

        let filteredList = this._list.filter(function (item) {
            return item.id === id;
        });

        if (filteredList.length === 0) this._list.push(new SpeechRequest(id, type));
    }

    remove(id){
        let result = false;

        if (isNaN(id)) return false;

        for(let i = 0; i < this._list.length; i++) {
            if (this._list[i].id === id) {
                result = this._list[i];
                this._list.splice(i, 1);
                i--;
            }
        }

        return result;
    }

    removeFirst(){
        return this._list.shift();
    }

    getLength(){
        return this._list.length;
    }

    reorder(id, idx) {
        if(isNaN(id) || !this._checkListBounds(idx)) return;

        let found = this.remove(id);

        if (found){
            this._list.splice(idx,0,found);
        }
    }

    toMessage(){
        return Util.wrapResponse(MESSAGE_KEY, SpeechRequest.listToJson(this._list));
    }

    _checkListBounds(idx){
        if(isNaN(idx)) return false;

        if (this._list.length === 0) return false;

        return !(idx < 0 || idx >= this._list.length);

    }
}

module.exports = SpeechList;