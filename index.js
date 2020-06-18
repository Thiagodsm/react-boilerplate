const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb+srv://boilerplate-user:boilerplate-user@cluster0-0pyhz.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority', 
    {useNewUrlParser: true,  useUnifiedTopology: true}).then(()=> console.log('DB connected...'))
                            .catch(err => console.error(err));


app.get('/', (req, res)=>{
    res.send('hello world1');
});



app.listen(5000);