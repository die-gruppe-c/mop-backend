const Util = require('../Util');

const MESSAGE_KEY = 'sortedList';


class SortedList {

    constructor(){
        this._list = [];
    }

    updateList(participants){

        this._list = [];

        participants.sort(function (a,b) {
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

        for (let i in participants) {
            if (!participants.hasOwnProperty(i)) continue;
            this._list.push(participants[i]._frontendId);
        }

    }


    toMessage(){
        return Util.wrapResponse(MESSAGE_KEY, this._list);
    }

}

module.exports = SortedList;