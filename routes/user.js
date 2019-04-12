var express = require('express');
var router = express.Router();
const passport = require('passport');
const auth = require('../src/config/auth');
var ModeratorDao = require('../src/db/daos/ModeratorDao');
var User = require('../src/db/models/Moderator');
const bcrypt = require('bcrypt-nodejs');



router.post('/login', auth.optional, function(req, res, next) {
    passport.authenticate('local', (err, passportUser, info) => {
        if(info) {return res.send(info.message)}
        if (err) { return next(err); }

        if(passportUser) {
            const user = passportUser;
            user.token = passportUser.generateJWT();

            return res.json({ user: user.toAuthJSON() });
        }

        return status(400).info;
    })(req, res, next);


});

router.post('/register', auth.optional, function(req, res) {

    if (!req.headers.email || !req.headers.password){
        res.status(400);
        res.send( "Zum Erstellen eines Benutzerkontos wird eine E-Mail und ein Passwort benötigt." );
        return;
    }

    let user_repo = new ModeratorDao();

    user_repo.getModByEMail(req.headers.email, function (mod) {
        if (mod) {
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
                }
            });

        });
    });

});

module.exports = router;