const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
    name: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
    email: String,
    password: String,
});

const User = mongoose.model("User", UserSchema);

const UserOptionsSchema = new Schema({
  brand: String,
  equipment: String,
  requests: [String],
  symptoms: [String],
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

const UserOptions = mongoose.model('UserOptions', UserOptionsSchema);

module.exports = {User, UserOptions};

