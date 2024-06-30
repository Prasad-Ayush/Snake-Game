const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Connecting to MongoDB
mongoose.connect('mongodb://localhost:27017/');

// Define User schema and model
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    hiscore:{type: Number, default:0}
});

const User = mongoose.model('User', userSchema);

//built in middleware
app.use(express.static('public'))
app.use(express.static('templates'))
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    console.log(__dirname)
    res.sendFile(__dirname + '/index.html');
});

app.get('/snake-game',(req,res)=>{
    res.sendFile('templates/index.html',{root:__dirname});
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists in MongoDB
        const user = await User.findOne({ username });

        if (!user) {
            return res.send('User not found. Please sign up.');
        }

        // Validate password
        if (user.password !== password) {
            return res.send('Incorrect password.');
        }

        // Successful login
        // redirect to game page
        return res.redirect('/snake-game');
    } catch (error) {
        console.error('Error during login:', error);
        res.send('Internal server error.');
    }
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.send('Username already taken. Please choose another.');
        }

        // Create a new user
        const newUser = new User({ username, password });
        await newUser.save();

        // Successful signup
        // Redirect to login page 
        res.redirect('/index.html');
    } catch (error) {
        console.error('Error during signup:', error);
        res.send('Internal server error.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
