var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt-nodejs');
var UserRepository = require('../src/db/daos/ModeratorDao');
var User = require('../src/db/models/Moderator');
const auth = require('../src/config/auth');


router.post('/', auth.optional, function(req, res) {

    if (!req.headers.email || !req.headers.password){
        res.status(400);
        res.send( "Zum Erstellen eines Benutzerkontos wird eine E-Mail und ein Passwort benötigt." );
        return;
    }

    let user_repo = new UserRepository();

    user_repo.getModByEMail(req.headers.email, function (user) {
        if (user) {
            res.status(400);
            res.send( "Es ist bereits ein Konto mit dieser E-Mail-Adresse hinterlegt." );
            return;
        }

        let salt = bcrypt.genSaltSync(10);

        bcrypt.hash(req.headers.password, salt, null, function (err, hash) {
            if (err) throw err;

            user_repo.createModerator(new User(0, req.headers.email, hash), function (result) {
                if (result.rowCount === 1){
                    res.status(201);
                    res.send( "Benutzer wurde erfolgreich erstellt." );
                    return;
                }
            });

        });
    });

});

module.exports = router;