var express = require('express');
var router = express.Router();
const auth = require('../src/config/auth');

var ModeratorDao = require('../src/db/daos/ModeratorDao');


/* GET home page. */
router.get('/', auth.required, function(req, res, next) {
  new ModeratorDao().getModById(req.user.id, function (mod) {
    res.send(mod.get_email());
  });
});

router.get('/open', auth.optional, function(req, res, next) {
  res.send("optional");
});


module.exports = router;
