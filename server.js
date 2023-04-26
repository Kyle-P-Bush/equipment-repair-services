
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require("bcrypt");


const User = require('./models/User');
const path = require('path');


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//for the pictures
app.use(express.static('public'));


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/options.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/options.html'));
});

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.error('Error connecting to MongoDB:', error);
});

app.post("/register", async (req, res) => {
    // Check if the user already exists
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
        return res.status(400).send("User already exists");
    }

    // Hash the password before saving the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user with the hashed password
    const newUser = new User({
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        phone: req.body.phone,
        email: req.body.email,
        password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    // Return a success message
    res.send("User registered successfully");
});

app.post("/login", async (req, res) => {
    // Find the user in the database using the provided email
    const user = await User.findOne({ email: req.body.email });

    // If the user is not found, return an error
    if (!user) {
        return res.status(400).send("Email or password is incorrect");
    }

    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

    // If the password is not valid, return an error
    if (!isPasswordValid) {
        return res.status(400).send("Email or password is incorrect");
    }

    // If the email and password are valid, return a success message
    res.json({message: "User logged in successfully" });
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

