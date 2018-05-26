const {database_url} = require("./../Configs/config");

const mongoose = require('mongoose');

mongoose.Promise = global.Promise; //Set default library to handle promise
mongoose.connect(database_url).then(() => {
        //This is connected
        console.log("Connected to db");
    },(error) => {
        //This is not connected
        console.log("Not connected to db:" + error);
        console.log("Check Configs/config file, maybe some parameters are wrong");
});

module.exports = {
    mongoose: mongoose
};