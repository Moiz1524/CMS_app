var User = require('../models/userModel');

var authorize = (req, res, next) => {
  if (req.user.isAdmin === true) {
    return next();
  }else {
    req.flash('Blocked!','Access Denied!');
    console.log('Blocked');
    res.redirect('/home');
  }
};


module.exports = {authorize};
