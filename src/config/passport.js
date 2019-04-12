const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt-nodejs');
var ModeratorDao = require('../db/daos/ModeratorDao');


// configure passport.js to use the local strategy
passport.use(new LocalStrategy(
    { usernameField: 'email'},
    (email, password, done) => {
        new ModeratorDao().getModByEMail(email, function (user) {
            if (user){
                if (!bcrypt.compareSync(password, user.get_password())) {
                    return done(null, false, { message: 'Invalid credentials.\n' });
                }
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid credentials.\n' });
            }
        });
    }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
    done(null, user.get_id());
});

passport.deserializeUser((id, done) => {
    new UserRepository().getModById(id, function (user) {
        done( null, user);
    });
});