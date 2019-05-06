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

        newAttr.checkWeights();

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

    checkWeights(){
        let sum = 0;
        let allNaN = true;

        this._values.forEach(function (value) {
            console.log(value._weight);
            if (value._weight) {
                allNaN = false;
                sum += +value._weight;
            }
        });

        if (!allNaN && sum !== 100){
            throw "Attribut-Gewichte müssen in der Summe 100 ergeben."
        }
    }

}

module.exports = Attribute;