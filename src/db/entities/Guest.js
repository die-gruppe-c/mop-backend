var Attribute = require('./Attribute');

class Guest {

    constructor( roomId, uuid, name, createdByOwner){
        this._roomId = roomId;
        this._uuid = uuid;
        this._name = name;
        this._createdByOwner = createdByOwner;
        this._online = false;
        this._attributes = [];
        this._frontendId = -1;
    }

    static createFromJson(json){
        let guest = new Guest(json.roomId, json.uuid, json.name, json.createdByOwner);

        for(let i = 0; i < json.attributes.length; i++){
            guest._attributes.push(Attribute.createFromJson(json.attributes[i]));
        }

        return guest;
    }

    toJson(uuid){
        let attributeJson = [];

        this._attributes.forEach(function (attribute) {
            attributeJson.push(attribute.toJson());
        });

        let json =  {
            roomId: this._roomId,
            uuid: uuid === this._uuid ? this._uuid : "",
            name: this._name,
            createdByOwner: this._createdByOwner,
            online: this._online,
            attributes: attributeJson
        };

        if (this._frontendId !== -1) json.frontend_id = this._frontendId;


        return json;
    }

    getValueForAttribute(attributeName){
        let filteredAttributes = this._attributes.filter(function (item) {
            return attributeName === item._name;
        });

        if (filteredAttributes.length === 0) return false;

        return filteredAttributes[0]._valueDurations[0];
    }

}

module.exports = Guest;