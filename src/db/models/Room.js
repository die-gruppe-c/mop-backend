var Attribute = require('./Attribute');

class Room {

    constructor( id, name, owner, creationDate, archived, running){
        this._id = id;
        this._name = name;
        this._owner = owner;
        this._creationDate = creationDate;
        this._archived = archived;
        this._running = running;
        this._attributes = [];
    }

    static generate_id(){
        return Math.floor(1000 + Math.random() * 9000);
    }

    static createFromJson(json){
        //creation date is always supplied by the backend
        let newRoom = new Room(json.id, json.name, json.owner, null, json.archived, json.running);

        for (let i = 0; i < json.attributes.length; i++) {
            newRoom._attributes.push(Attribute.createFromJson(json.attributes[i]));
        }

        return newRoom;
    }

    toJson(uuid){
        let attributeJson = [];

        this._attributes.forEach(function (attribute) {
            attributeJson.push(attribute.toJson());
        });

        return {
            id: this._id,
            name: this._name,
            owner: uuid === this._owner ? this._owner : "",
            created_on: this._creationDate,
            archived: this._archived,
            running: this._running,
            attributes: attributeJson
        }
    }

}

module.exports = Room;