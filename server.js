
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require("bcrypt");
const session = require('express-session');



const {User, UserOptions} = require('./models/User');
const path = require('path');


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//for the pictures
app.use(express.static('public'));

//express-session for cookies
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

//auth imports
const passport = require('passport');
require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/options.html', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/options.html'));
});

app.get('/after-options-submit', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/after-options-submit.html'));
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

app.post("/login", async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).send("Email or password is incorrect");
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.session.user = user; 
            res.json({message: "User logged in successfully" });
        });
    })(req, res, next);
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

app.post('/options', async (req, res) => {
    const { brand, equipment, requests, symptoms, schedule} = req.body;

    if (req.session && req.session.user) { 
        const userOptions = new UserOptions({
            brand,
            equipment,
            requests,
            symptoms,
            schedule,
            userId: req.session.user._id, 
        });

        try {
            await userOptions.save();
            res.redirect('/acceptance');
        } catch (err) {
            res.status(500).send('Error saving user options');
            console.error(err);
        }
    } else {
        res.status(401).send('Unauthorized');
    }
});

app.post('/schedule', async (req, res) => {
    // Assume you have a Schedule model defined somewhere
    const { date, time, description } = req.body;

    if (req.session && req.session.user) {
        const userSchedule = new Schedule({
            date,
            time,
            description,
            userId: req.session.user._id,
        });

        try {
            await userSchedule.save();
            res.status(201).send('Schedule saved');
        } catch (err) {
            res.status(500).send('Error saving schedule');
            console.error(err);
        }
    } else {
        res.status(401).send('Unauthorized');
    }
});

app.get('/acceptance', ensureAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user._id);
    const userOptions = await UserOptions.findOne({userId: user._id});

    res.render('acceptance', {user, userOptions});
});



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

