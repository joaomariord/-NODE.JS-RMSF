const mongoose = require('mongoose');

// noinspection SpellCheckingInspection
const database_url = process.env.MONGODB_URI || "mongodb://heroku_49mrdg0x:bkllahlbeljncb6t2vi7uojkfv@ds261088.mlab.com:61088/heroku_49mrdg0x";

mongoose.Promise = global.Promise; //Set default library to handle promise
mongoose.connect(database_url).then(() => {
        //This is connected
        console.log("Connected to db");
    },(error) => {
        //This is not connected
        console.log("Not connected to db:" + error);
    });

module.exports = {
    mongoose: mongoose
};