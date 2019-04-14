const jwt = require('jsonwebtoken');

class Moderator {

    constructor( id, email, password ){
        this._id = id;
        this._email = email;
        this._password = password;
    }

    generateJWT(){
        return jwt.sign({
            email: this._email,
            id: this._id,
        }, 'secret');
    }

    toAuthJSON() {
        return {
            id: this._id,
            email: this._email,
            token: this.generateJWT(),
        };
    };

}

module.exports = Moderator;