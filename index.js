const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Bring the key.js file to check if we are on production or dev mode
const config = require('./config/key');

// Bring the user model that we created
const {User} = require('./models/user');

const app = express();

mongoose.connect(config.mongoURI, 
    {useNewUrlParser: true,  useUnifiedTopology: true}).then(()=> console.log('DB connected...'))
                            .catch(err => console.error(err));


app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.get('/', (req, res)=> {
    res.json({"Hello ~": "thiagos2"})
})

app.post('/api/users/register', (req, res) =>{
    const user = new User(req.body)

    user.save((err, userData) =>{
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
    
})



app.listen(5000);