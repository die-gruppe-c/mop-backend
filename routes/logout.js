var express = require('express');
var router = express.Router();
const auth = require('../src/config/auth');

router.get('/', auth.optional, function(req, res, next) {
    req.logout();
    res.send("You are now logged out!")
});



module.exports = router;