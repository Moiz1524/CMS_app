var passport = require('passport');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var User = require('./../models/userModel');
var nodemailer = require('nodemailer');
// const {body} = require('express-validator/check');

module.exports = (app) => {
  app.get('/', (req, res, next) => {
      res.render('index.ejs', {title: 'Index'});
    });

  app.get('/signup', (req, res) => {
    var errors = req.flash('error');
    console.log(errors);
    res.render('user/signup.ejs', {title: 'Sign Up', messages: errors, hasErrors: errors.length > 0});
  });

  app.get('/login', (req, res) => {
    var errors = req.flash('error');
    console.log(errors);
    res.render('user/login.ejs', {title: 'Login', messages: errors, hasErrors: errors.length > 0});
  });

  app.post('/signup', validate, passport.authenticate('local.signup', {
    successRedirect: '/home_1',
    failureRedirect: '/signup',
    successFlash: 'Valid',
    failureFlash: 'Invalid'
  }));

  app.post('/login', validateLogin, passport.authenticate('local.login', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
  }));

  app.get('/home_1', (req, res) => {
    var success = req.flash('Success!');
    res.render('admin_home.ejs', {
      title: 'CMS || Admin',
      user: req.user,
      success: success,
      noErrors: success.length > 0
    })
  })

  app.get('/home', (req, res) => {
    res.render('home.ejs', {title: 'Home || CMS', user: req.user});
  });

  app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy((err) => {
      res.redirect('/');
    });
  });

  app.get('/all_users', (req, res) => {
    User.find({}, (err, result) => {
      if (err) {
        return console.log('Unable to fetch all users.');
      }
      console.log(JSON.stringify(result, undefined, 2));
      res.render('users.ejs', {
        title: 'All Users || CMS',
        user: req.user,
        data: result
      })
    });
  });

};

var validateLogin = (req, res, next) => {
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    var messages = [];
    errors.forEach((error) => {
      messages.push(error.msg);
    });

    req.flash('error', messages);
    res.redirect('/login');
  }else {
    next();
  }
}

var validate = (req, res, next) => {
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('username', 'Username must not be less than 5').isLength({min: 5});
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is invalid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password', 'Password must not be less than 5').isLength({min: 5});
  req.check("password", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");
  req.checkBody('confirmPassword', 'Passwords Mismatched!').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    var messages = [];
    errors.forEach((error) => {
      messages.push(error.msg);
    });

    req.flash('error', messages);
    res.redirect('/signup');
  }else {
    return next();
  }
}

// var validateUser = (req, res) => {
//   if (req.body.isAdmin === true) {
//
//   }
  // body('passwordConfirmation').custom((value, {req}) => {
  //   if (value !== req.body.password) {
  //     throw new Error ('Password confirmation does not match');
  //   })
  //
