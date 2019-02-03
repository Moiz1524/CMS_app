var User = require('../models/userModel');
var passport = require('passport');

var authenticate = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }else {
    req.flash('Denied!','Please Login first');
    res.redirect('/login');
  }
};


module.exports = {authenticate};
