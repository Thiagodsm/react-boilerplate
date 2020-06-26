const {User} = require('../models/user');

let auth = (req, res, next) => {
    // get the token to check is the user is authenticated or not
    let token = req.cookies.x_auth;

    // find the user of the token
    User.findByToken(token, (err, user)=>{
        if(err) throw err;
        if(!user) 
            return res.json({
            isAuth: false,
            error: true
        });

        req.token = token;
        req.user = user;
        next();
    });
};

module.exports = {auth};