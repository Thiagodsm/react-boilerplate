const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


// variable for the token - jsonwebtoken
const jwt = require('jsonwebtoken');


const saltRounds = 10; // ten charactes to generate the salt

const userSchema = mongoose.Schema({
    name:{
        type:String,
        maxlength: 50,
    },
    email:{
        type:String,
        trim:true,
        unique:1
    },
    password:{
        type: String,
        minlength:5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    token:{
        type: String,
    },
    tokenExp:{
        type: Number
    }

})

// This function is used to encrypt the password before send to the db
userSchema.pre('save', function(next){ // this functions meand, before save, do these things...
    var user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err);

            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);
                user.password = hash;
                next()
            })
        })
    }
    else{
        next()
    }
});

// This function will compare the password for the user that wants make a login
// this function recieve two paramets, the hashed password of the monogodb and the password from the request
// cb -- hash
userSchema.methods.comparePassword = function(plainPassword, cb) {
    // this.password, is the password that we have on the db
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch)
    }) 
}

// Function that generate the token for the login 
userSchema.methods.generateToken = function(cb){
    var user = this;
    var token = jwt.sign(user._id.toHexString(), 'secret') // this _id id from mongodb

    user.token = token;
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user);
    })
}

// Verify the token on the cookie
userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    // standard function to verify the token 
    jwt.verify(token, 'secret', function(err, decode){
        user.findOne({"_id":decode, "token":token}, function(err, user){
            if(err) return cb(err); // if there is an error call the callback function
            cb(null, user);
        })
    })
}


const User = mongoose.model('User', userSchema);

module.exports = {User}