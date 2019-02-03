var passport = require('passport');
var User = require('../models/userModel');
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require('nodemailer');
// var fs = require('fs');
// var path = require('path');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

// passport.use('local.signup', new LocalStrategy({
//     username: 'username',
//     password: 'password',
//     passReqToCallback: true
// }, (req, username, password, done) => {
//     var nameUser = req.body.username;
//     var userPassword = req.body.password;
//     User.findOne({username}, (err, user) => {
//         if (err) {
//           console.log('Error found');
//           return done(err);
//         }
//
//         if (user) {
//           return done(null, false, req.flash('error', 'User with Email already exist!.'));
//         }
//
//         var user = new User();
//         // console.log(req.body);
//
//         user.username = req.body.username;
//         user.email = req.body.email;
//         user.password = req.body.password;
//         user.confirmPassword = req.body.confirmPassword;
//         user.image = req.body.upload;
//         user.password = user.encryptPassword(req.body.password);
//         user.confirmPassword = user.encryptPassword(req.body.confirmPassword);
//
//
//         user.save((err) => {
//           console.log('1 collection entered');
//           return done(null, user);
//         });
//       });
//
//         req.flash('Success!', 'User saved successfully');
//         console.log('Control entered!.');

//
// }));

passport.use('local.login', new LocalStrategy({
    username: 'username',
    password: 'password',
    passReqToCallback: true
}, (req, username, password, done) => {

    User.findOne({username}, (err, user) => {
        if (err) {
          console.log('Error found');
          return done(err);
        }

        var messages = [];

        if (!user || !user.validPassword(password)) {
          messages.push('User not found or Password is invalid!.');
          return done(null, false, req.flash('error', messages));
        }

        if (user.isAdmin === true) {
          console.log('Logged in as admin');
        }
        return done(null, user);

    });
}));
