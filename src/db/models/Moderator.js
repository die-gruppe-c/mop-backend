const jwt = require('jsonwebtoken');

class Moderator {

    constructor( id, email, password ){
        this.id = id;
        this.email = email;
        this.password = password;
    }

    get_id(){
        return this.id;
    }

    get_email(){
        return this.email;
    }

    get_password(){
        return this.password;
    }

    generateJWT(){
        return jwt.sign({
            email: this.email,
            id: this.id,
        }, 'secret');
    }

    toAuthJSON() {
        return {
            id: this.id,
            email: this.email,
            token: this.generateJWT(),
        };
    };

}

module.exports = Moderator;