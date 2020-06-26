const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Bring the key.js file to check if we are on production or dev mode
const config = require('./config/key');

// Bring the user model that we created
const {User} = require('./models/user');

// Bring the function thata checks the token 
const {auth} = require('./middleware/auth');

const app = express();

mongoose.connect(config.mongoURI, 
    {useNewUrlParser: true,  useUnifiedTopology: true}).then(()=> console.log('DB connected...'))
                            .catch(err => console.error(err));


app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

// Routes

// route login and authentication

// middleware only logged user can upload files
// auth is the middleware i.e the function that is called and get the request
app.get("/api/user/auth", auth, (req,res)=>{
    // these info will be show on the console of the browser
    res.status(200).json({
        _id:req._id,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role
    })
})

// route to register
// only authenticated users can reach this routing
app.post('/api/users/register', (req, res) =>{
    const user = new User(req.body)

    // Here we'll hash our password with bcrypt


    user.save((err, doc) => {
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true,
            userData: doc
        })
    })  
})

// route to login
app.post('/api/user/login', (req,res) =>{
    // find email
    User.findOne({email: req.body.email}, (err, user) => {
        if(!user)
        return res.json({
            loginSuccess: false,
            message: "Auth failed, email not found"
        });
        // compare password
        user.comparePassword(req.body.password, (err, isMatch) =>{
            if(!isMatch){
                return res.json({loginSuccess: false, message:"wrong password"})
            }
        })
        // gerateToken for the password
        // if the generation of the token is OK we storage it in a cookie
        user.generateToken((err, user) => {
            if(err) return res.status(400).send(err);
            res.cookie("x_auth", user.token)
                .status(200)
                .json({
                    loginSuccess:true
                });
        });
    });
});


// route to logout
// first we need to authenticate the user with AUTH
// after find the id of the user, the token recieve an empty string 
app.get('/api/user/logout', auth, (req, res)=>{
    User.findByIdAndUpdate({_id: req.user._id}, {token: ""}, (err, doc)=>{
        if(err) return res.json({success: false, err})
        return res.status(200).send({
            success:true
        });
    });
});
// find the id of the user on the database

// To create an app on Heroku: download the heroku CLI, heroku -v, heroku login, heroku create
// We need to define the port auto, because the 5000 will be only use on the devlopment mode
// for this we'll use the function below
const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Server Running at ${port}`)
});