var AttributeValue = require('./AttributeValue');

class Attribute {

    constructor( name ){
        this._name = name;
        this._values = [];
    }

    static createFromJson(json){
        let newAttr = new Attribute(json.name);
        for (let i = 0; i < json.values.length; i++) {
            newAttr._values.push(AttributeValue.createFromJson(json.values[i]));
        }
        return newAttr;
    }

    toJson(){
        let valueJson = [];

        this._values.forEach(function (value) {
            valueJson.push(value.toJson());
        });

        return {
            name: this._name,
            values: valueJson
        };
    }

}

module.exports = Attribute;