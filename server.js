var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');


const port = process.env.PORT || 3000;



var app = express();


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/CMS_db', {useNewUrlParser: true})


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

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
