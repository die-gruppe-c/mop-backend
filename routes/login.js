var express = require('express');
var router = express.Router();
const passport = require('passport');
const auth = require('../auth');


router.post('/', auth.optional, function(req, res, next) {
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

module.exports = router;