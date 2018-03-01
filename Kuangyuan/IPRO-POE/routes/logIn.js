var express = require('express');
var router = express.Router();

/* GET log in. */
router.get('/', function(req, res, next) {
    res.render('logIn');
});

router.post('/', function (req, res) {
    var email = req.body.inputEmail;
    var pw = req.body.inputPassword;
    //res.send("get post: email="+email+"pw="+pw)
    res.render('manDev')
});

module.exports = router;
