var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res, next) {

});

router.get('/open', function(req, res, next) {
  res.send("optional");
});


module.exports = router;
