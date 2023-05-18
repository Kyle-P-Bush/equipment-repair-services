const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
    name: {
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
    state:{
        type: String,
        required: true
    }, 
    zip: {
        type: String,
        required: true
    },
    phone: {
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
});

const User = mongoose.model("User", UserSchema);

const UserOptionsSchema = new Schema({
  brand: String,
  equipment: String,
  requests: [String],
  symptoms: [String],
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  schedule: {
    date: Date,
    time: String, 
    description: String
  }
});

const UserOptions = mongoose.model('UserOptions', UserOptionsSchema);

module.exports = {User, UserOptions};

