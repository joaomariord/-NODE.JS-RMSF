const {User} = require("./../Models/user");

let authenticate = (req, res, next) => {
    let token = req.header("x-auth"); //Requires a x-auth header with the authentication token

    User.findByToken(token).then((user) => {
        if(!user) {
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    }).catch( () => {
        res.status(401).send({});
    });
};

module.exports = {authenticate};