var express = require('express');
var router = express.Router();
const auth = require('../src/config/auth');

var ModeratorDao = require('../src/db/daos/ModeratorDao');


/* GET home page. */
router.get('/', auth.required, function(req, res, next) {
  ModeratorDao.getModById(req.moderator.js.id, function (mod) {
    res.send(mod._email);
  });
});

router.get('/open', auth.optional, function(req, res, next) {
  res.send("optional");
});


module.exports = router;
