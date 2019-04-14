var express = require('express');
var router = express.Router();
const auth = require('../src/config/auth');
const uuid = require('uuid/v4');
var GuestDao = require('../src/db/daos/GuestDao');
var Guest = require('../src/db/models/Guest');


router.get('/request', auth.optional, function(req, res, next) {
    var token = uuid();

    GuestDao.insertGuestToken(new Guest(token), function (result) {
        res.status(201);
        res.json({"guest_token": token});
    });
});

module.exports = router;
