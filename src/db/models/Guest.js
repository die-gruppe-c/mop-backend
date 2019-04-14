
class Guest {

    constructor( uuid ){
        this._uuid = uuid;
    }

    set_name(name){
        this._name = name;
    }

}

module.exports = Guest;