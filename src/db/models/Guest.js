var Attribute = require('./Attribute');

class Guest {

    constructor( roomId, uuid, name, createdByOwner){
        this._roomId = roomId;
        this._uuid = uuid;
        this._name = name;
        this._createdByOwner = createdByOwner;
        this._attributes = [];
    }

    static createFromJson(json){
        let guest = new Guest(json.roomId, json.uuid, json.name, json.createdByOwner);

        for(let i = 0; i < json.attributes.length; i++){
            guest._attributes.push(Attribute.createFromJson(json.attributes[i]));
        }

        return guest;
    }

}

module.exports = Guest;