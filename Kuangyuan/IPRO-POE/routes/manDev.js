var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    var lightList = ['p1', 'p2'];
    res.render('manDev', {lightList:lightList})
});

module.exports = router;