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

passport.use('local.signup', new LocalStrategy({
    username: 'username',
    password: 'password',
    passReqToCallback: true
}, (req, username, password, done) => {
    var nameUser = req.body.username;
    var userPassword = req.body.password;
    User.findOne({username}, (err, user) => {
        if (err) {
          console.log('Error found');
          return done(err);
        }

        if (user) {
          return done(null, false, req.flash('error', 'User with Email already exist!.'));
        }

        var newUser = new User();
        // console.log(req.body);

        newUser.username = req.body.username;
        newUser.email = req.body.email;
        newUser.password = req.body.password;
        newUser.confirmPassword = req.body.confirmPassword;
        newUser.image = req.body.upload;
        newUser.password = newUser.encryptPassword(req.body.password);
        newUser.confirmPassword = newUser.encryptPassword(req.body.confirmPassword);


        newUser.save((err) => {
            console.log('1 collection entered');
            return done(null, newUser);
        });
      });

        req.flash('Success!', 'User saved successfully');
        console.log('Control entered!.');
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'amoiz4142@gmail.com',
            pass: '8273610S'
          },
          tls: {
            rejectUnauthorized: false
          }
        });

      var mailOptions = {
        from: 'amoiz4142@gmail.com',
        to: req.body.email,
        subject: 'Login Credentials',
        text: `Hey there! Welcome to CMS! You can evaluate the amazing features by just signing in.
        Your Login Credentials are: Username: ${nameUser}, Password: ${userPassword}`
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });

}));

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
