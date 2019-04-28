class AttributeValue {

    constructor( name, color, weight){
        this._name = name;
        this._color = color;
        this._weight = weight;
    }

    static createFromJson(json){
        return new AttributeValue(json.name, json.color, json.weight);
    }

    toJson(){
        return {
          name: this._name,
          color: this._color,
          weight: this._weight
        };
    }

}

module.exports = AttributeValue;