var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');

var userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  confirmPassword: {
    type: String,
    default: '',
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  image: {
    type: String
  }
});

userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

// userSchema.methods.generateAuthToken = function () {
//   var user = this;
//   var access = 'auth';
//   var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
//
//   // user.tokens.push({access, token});
//   user.tokens = user.tokens.concat([{access, token}]);
//
//   return user.save().then(() => {
//     return token;
//   });
//
// };

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// userSchema.methods.validateUser = function (isAdmin) {
//
// };

module.exports = mongoose.model('User', userSchema);
