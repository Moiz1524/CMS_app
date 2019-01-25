var mongoose = require('mongoose');

var contactSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone_no: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  sector: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  image: {
    type: String
  }
});


module.exports = mongoose.model('Contact', contactSchema);
