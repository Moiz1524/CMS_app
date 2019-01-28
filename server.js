var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoDBStore = require('connect-mongodb-session')(session);
// var MongoStore = require('connect-mongodb')(session);
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');


var app = express();

const port = process.env.PORT || 3000;


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/CMS_db', {useNewUrlParser: true})

var store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/CMS_db',
  collection: 'sessions'
});

// Catch errors
store.on('error', function(error) {
  console.log(error);
});

app.use(require('express-session')({
  secret: 'This is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  // Boilerplate options, see:
  // * https://www.npmjs.com/package/express-session#resave
  // * https://www.npmjs.com/package/express-session#saveuninitialized
  resave: false,
  saveUninitialized: false
}));

require('./config/passport');


app.use(express.static('public'));
app.engine('ejs', engine);
app.set('view-engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(validator());


// app.use(session({
//   secret: 'Thisismytestkey',
//   resave: false,
//   saveUninitialized: false,
//   store: new MongoStore({mongooseConnection: mongoose.connection})
// }));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

require('./routes/user')(app);
require('./routes/newContact')(app);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
