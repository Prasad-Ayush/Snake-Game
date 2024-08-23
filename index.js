const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;
var userDet = null;

// Connecting to MongoDB
mongoose.connect('mongodb://localhost:27017/');

// Define User schema and model
const userSchema = new mongoose.Schema({
    username: String,
    password: {type: String, minlength:6},
    hiscore: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

//built in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use(express.static('templates'))

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists in MongoDB
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.send('User not found. Please sign up.');
        }
        // Validate password
        const isAuth = await bcrypt.compare(password, user.password);
        if (!isAuth) {
            return res.send('Incorrect password.');
        }
        
        // Successful login
        userDet = user;
        res.status(202).redirect('/snake-game');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal server error.');
    }
});

//Signup
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.send('Username already taken. Please choose another.');
        }

        // Create a new user
        if(password.length < 5) {
            return res.send('Password must be at least 5 characters long');
        }

        const hash = await bcrypt.hash(password, 10)
        const newUser = new User({
            username,
            password: hash
        });
        await newUser.save()

        // Successful signup
        // Redirect to login page 
        res.status(201).redirect('/index.html');
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Internal server error.');
    }
});

//Middleware
const auth = ((req, res, next) => {
    if (userDet === null) {
        res.status(401).send('You are Unauthorized!');
    }
    else {
        console.log('Authorized');
        next();
    }
})

app.get('/snake-game', auth, (req, res) => {
    res.sendFile('templates/index.html', { root: __dirname });
})

//Get Data
app.get('/snake-game/get-data', async (req, res) => {
    try {
        const doc = await User.findOne({ username: userDet.username }, 'username hiscore');
        res.status(200).json(doc);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//Update Data
app.patch('/snake-game/:un/:hs', async (req, res) => {
    const un = req.params.un;
    const hs = +req.params.hs;
    try {
        const doc = await User.findOneAndUpdate({ username: un }, { hiscore: hs }, { new: true })
        if (!doc) {
            // Handle case where user is not found
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('updated');
        res.json({ hiscore: doc.hiscore });
    }
    catch (err) {
        console.log(err);
        res.json(err);
    }
})

//Logout
app.get('/snake-game/logout', (req, res) => {
    try {
        userDet = null;
        res.redirect('/');
    }
    catch (err) {
        console.log(err);
        res.sendStatus(404);
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});