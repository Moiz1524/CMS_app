var passport = require('passport');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var User = require('./../models/userModel');
var nodemailer = require('nodemailer');
var {authenticate} = require('./../middlewares/authenticate');
var {authorize} = require('./../middlewares/authorize');
// const {body} = require('express-validator/check');

module.exports = (app) => {
  app.get('/', (req, res, next) => {
      res.render('index.ejs', {title: 'Index'});
    });

  app.get('/signup', authenticate, authorize, (req, res) => {
    var errors = req.flash('error');
    console.log(errors);
    res.render('user/signup.ejs', {title: 'Sign Up', messages: errors, hasErrors: errors.length > 0});
  });

  app.get('/login', (req, res) => {
    var error_1 = req.flash('Denied!');
    var errors = req.flash('error');
    console.log(errors);
    console.log(error_1);
    res.render('user/login.ejs', {
      title: 'Login',
      errorOutput: error_1,
      loginFirst: error_1.length > 0,
      messages: errors,
      hasErrors: errors.length > 0});
  });

  app.post('/signup', validate, (req, res) => {
    var nameUser = req.body.username;
    var userPassword = req.body.password;
    User.findOne({
      email: req.body.email
    }, (err, result) => {
      if (result) {
        console.log('User already exists!.');
        console.log(JSON.stringify(result, undefined, 2));
        req.flash('error', 'User already exists with the email you entered!.')
        res.redirect('/signup');
      }else {

      var user = new User(req.body);
        // console.log(req.body);

      // user.username = req.body.username;
      // user.email = req.body.email;
      // user.password = req.body.password;
      // user.confirmPassword = req.body.confirmPassword;
      user.image = req.body.upload;
      user.password = user.encryptPassword(req.body.password);
      user.confirmPassword = user.encryptPassword(req.body.confirmPassword);
      // user.generateAuthtoken();

      user.save((err, user) => {
        if (err) {
          return console.log('Unable to save user.', err);
        }
          return user;
      });

      req.flash('Registered!', 'User created successfully!');

      var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'amoiz4142@gmail.com',
            pass: 'Yolo18M:)'
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
      res.redirect('/home');
    }});
});

  app.post('/login', validateLogin, passport.authenticate('local.login', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
  }));

  // app.get('/home_1', (req, res) => {
  //   var success = req.flash('Success!');
  //   res.render('admin_home.ejs', {
  //     title: 'CMS || Admin',
  //     user: req.user,
  //     success: success,
  //     noErrors: success.length > 0
  //   })
  // })

  app.get('/home', authenticate, (req, res) => {
    var userCreated = req.flash('Registered!');
    var blocked = req.flash('Blocked!');
    res.render('home.ejs', {
      title: 'Home || CMS',
      user: req.user,
      blocked,
      hasErrors: blocked.length > 0,
      userCreated,
      userCreatedLength: userCreated.length > 0
    });
  });

  app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy((err) => {
      res.redirect('/');
    });
  });

  app.get('/all_users', authenticate, (req, res) => {
    var deleted = req.flash('Deleted!');
    var success = req.flash('Success!')
    User.find({}, (err, result) => {
      if (err) {
        return console.log('Unable to fetch all users.');
      }
      console.log(JSON.stringify(result, undefined, 2));
      res.render('users.ejs', {
        title: 'All Users || CMS',
        user: req.user,
        data: result,
        success,
        noErrors: success.length > 0,
        deleted,
        noDeleteErrors: deleted.length > 0
      })
    });
  });

  app.get('/delete_user', authenticate, authorize, (req, res) => {
    res.render('deleteUser.ejs', {
      title: 'Delete User || CMS',
      user: req.user
    })
  });

  app.post('/delete_user', authenticate, (req,res) => {
    var username = req.body.username;
    User.findOneAndRemove({username}, (err, result) => {
      if (err) {
        return console.log('Unable to delete the user', err);
      }

      if (!result) {
        console.log('User does not exist!.');
      }

      req.flash('Success!', 'User deleted successfully');
      res.redirect('/all_users');

    });
  });

  app.delete('/user/:id', (req, res) => {
    User.remove({_id: req.params.id}, (err, result) => {
      if (err) {
        return console.log(err)
      }
    res.send('Success');
  });
    req.flash('Deleted!', 'User deleted!');
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
};

// var validateUser = (req, res) => {
//   if (req.body.isAdmin === true) {
//
//   }
  // body('passwordConfirmation').custom((value, {req}) => {
  //   if (value !== req.body.password) {
  //     throw new Error ('Password confirmation does not match');
  //   })
  //
