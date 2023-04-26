const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    // Your schema definition here
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

module.exports = User;

