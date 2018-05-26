//This parameters give support for heroku deployment and local deployment
//The structure of each param is:
// const NODEJS_CONST_NAME = process.env.HEROKU_CONST_NAME || LOCAL_DEPLOYMENT_VALUE
//You are free to change each value of LOCAL_DEPLOYMENT_VALUE for any local deployment, so it fit your needs
//Try to keep HEROKU part intact so it keeps working on heroku


//This is the server running port (heroku gives one by himself)
const PORT = process.env.PORT || 80;

//MongoDB URI -> The database used must be configured on heroku or local machine
// In heroku is recommended to use mLab mongoDB sandbox
//The current value in local deployment part will work fine, because it refers to the mLab mongoDB already deployed on heroku
const database_url = process.env.MONGODB_URI || "mongodb://heroku_49mrdg0x:bkllahlbeljncb6t2vi7uojkfv@ds261088.mlab.com:61088/heroku_49mrdg0x";

//App secret and gen salt runs -> Basic cryptography
const app_secret = process.env.JWT_SECRET || "thisisasecret";
const gen_salt_runs = process.env.SALT_RUNS || 10;

module.exports = {
    PORT,
    database_url,
    app_secret,
    gen_salt_runs
};