var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var mongoose = require('mongoose');
// var MongoDBStore = require('connect-mongodb-session')(session);
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');


var app = express();

const port = process.env.PORT || 3000;


mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI ||  'mongodb://localhost:27017/CMS_db', {useNewUrlParser: true});

require('./config/passport');


app.use(express.static('public'));
app.engine('ejs', engine);
app.set('view-engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(validator());


app.use(session({
  secret: 'Thisismytestkey',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

require('./routes/user')(app);
require('./routes/newContact')(app);

app.use(function(req, res, next){
  res.status(404);

  res.format({
    html: function () {
      res.render('404.ejs', { url: req.url })
    },
    json: function () {
      res.json({ error: 'Not found' })
    },
    default: function () {
      res.type('txt').send('Not found')
    }
  })
});

app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.render('500.ejs', { error: err });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
