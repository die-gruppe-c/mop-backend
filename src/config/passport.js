const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt-nodejs');
var ModeratorDao = require('../db/daos/ModeratorDao');


// configure passport.js to use the local strategy
passport.use(new LocalStrategy(
    { usernameField: 'email'},
    (email, password, done) => {
        ModeratorDao.getModByEMail(email, function (moderator) {
            if (moderator){
                if (!bcrypt.compareSync(password, moderator._password)) {
                    return done(null, false, { message: 'Invalid credentials.\n' });
                }
                return done(null, moderator);
            } else {
                return done(null, false, { message: 'Invalid credentials.\n' });
            }
        });
    }
));

// tell passport how to serialize the user
passport.serializeUser((moderator, done) => {
    done(null, moderator._id);
});

passport.deserializeUser((id, done) => {
    ModeratorDao.getModById(id, function (user) {
        done( null, user);
    });
});