var Contact = require('./../models/contactModel');
var mongoose = require('mongoose');
var {ObjectID} = require('mongodb');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var {authenticate} = require('./../middlewares/authenticate');

module.exports = (app) => {
   app.get('/contact/create', authenticate, (req, res) => {
     var success = req.flash('Success!');
     res.render('contacts/contact.ejs', {
       title: 'Contact Registration',
       user: req.user,
       success: success,
       noErrors: success.length > 0
     });
   });

   app.post('/contact/create', authenticate, validateContact, (req, res) => {
     var newContact = new Contact();
     newContact.name = req.body.name;
     newContact.phone_no = req.body.phone_no;
     newContact.address = req.body.address;
     newContact.city = req.body.city;
     newContact.country = req.body.country;
     newContact.sector = req.body.sector;
     newContact.website = req.body.website;
     newContact.image = req.body.upload;
     newContact._creator = req.user.id;

     Contact.findOne({newContact}, (err) => {
       if (err) {
        return console.log('Contact already exists!.')
       }

      newContact.save((err) => {
        if (err) {
          return console.log('Error encountered:', err);
        }

        console.log(JSON.stringify(newContact, undefined, 2));
        req.flash('Success!', 'Contact saved successfully');
        res.redirect('/contact/create');
      });
   });
 });

   app.get('/contact/search', authenticate, (req, res) => {
       res.render('contacts/search.ejs', {
         title: 'Search Contact',
         user: req.user
     });
   });

   app.get('/contacts_all', authenticate, (req, res) => {
     if (req.user.username === 'Moiz Ali') {
       Contact.find({}, (err, result) => {
         console.log(JSON.stringify(result, undefined, 2));
         res.render('contacts/contacts_all.ejs', {
           title: 'All Contacts || CMS',
           user: req.user,
           data: result
         });
       });
     }else {
       Contact.find({_creator: req.user._id}, (err, result) => {
         console.log(JSON.stringify(result, undefined, 2));
         res.render('contacts/contacts_all.ejs', {
           title: 'All Contacts || CMS',
           user: req.user,
           data: result
         });
       });
     }
   });

   app.post('/contact/search', (req, res) => {
     var name = req.body.name;
     if (req.user.username === 'Moiz Ali') {
       Contact.findOne({name}, (err, data) => {
         if (err) {
          return console.log(err);
         }
         if (data === null) {
           res.redirect('/contact/search_result/:id');
         }else {
           console.log(JSON.stringify(data, undefined, 2));
           res.redirect('/contact/search_result/' + data._id);
         }
       });
     }else {
       Contact.findOne({
         name,
         _creator: req.user._id
       }, (err, data) => {
         if (err) {
          return console.log(err);
         }
         if (data === null) {
           res.redirect('/contact/search_result/:id');
         }else {
           console.log(JSON.stringify(data, undefined, 2));
           res.redirect('/contact/search_result/' + data._id);
         }
       });
     }

});
   app.get('/contact/search_result/:id', authenticate, (req, res) => {
       Contact.findOne({'_id': req.params.id}, (err, data) => {
         res.render('contacts/search_result.ejs', {
           title: 'Search Result || CMS',
           user: req.user,
           data: data
         });
       })
   });

   app.post('/upload', (req, res) => {
     var form = new formidable.IncomingForm();
     form.uploadDir = path.join(__dirname, '../public/uploads');

     form.on('file', (field, file) => {
       fs.rename(file.path, path.join(form.uploadDir, file.name), (err) => {
         if (err) {
           throw err;
         }
         console.log('File has been renamed');
       });
     });

     form.on('error', (err) => {
       console.log('Error occurred!.',err);
     });

     form.on('end', () => {
       console.log('File upload gone successful!')
     });

     form.parse(req);
   })

};


var validateContact = (req, res, next) => {
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('address', 'Address is required').notEmpty();
  req.checkBody('city', 'City is required').notEmpty();
  req.checkBody('country', 'Country is required').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    var messages = [];
    errors.forEach((error) => {
      messages.push(error.msg);
    });

    req.flash('error', messages);
    res.redirect('/home');
  }else {
    return next();
  }
}

// mongoose.connect('mongodb://localhost:27017/CMS_db', {useNewUrlParser: true}, (err, db) => {
//   db.collection('contacts').find(name).toArray().then((docs)=> {
//     console.log(JSON.stringify(docs, undefined, 2));
//   });
// })
