const {mongoose} = require("./../DB/mongoose");
const validator = require("validator");

const jwt = require("jsonwebtoken");
const _ = require('lodash');
const bcrypt = require("bcryptjs");

//Create user schema
let UserSchema = mongoose.Schema({
    email: {
        required: true,
        trim: true,
        type: String,
        minlength: 4,
        unique: true,
        validate: {
            validator: validator.isEmail,
            isAsync: false,
            message: "{VALUE} is not a valid email"
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    name:{
        type:String,
        required: true,
        minlength: 3
    },
    tokens: [{ //TODO: Here we leak some memory, but I expect to correct this sometime
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.statics.findByCredentials = function (email, password) {
    let User = this;

    return User.findOne({email}).then( (user) => {
        if(!user) {
            return Promise.reject();
        }

        return new Promise( (resolve, reject) => {
            bcrypt.compare(password, user.password, (err, result) => {
                if(result){
                    return resolve(user);
                }else {
                    return reject();
                }
            });
        });
    });
};

UserSchema.statics.findByToken = function (token) {
    let User = this;
    let decoded;

    try {
        // noinspection SpellCheckingInspection
        decoded = jwt.verify(token, process.env.JWT_SECRET||"thisisasecret");
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        "_id": decoded._id,
        "tokens.token": token,
        "tokens.access": "auth"
    });
};

UserSchema.pre("save", function (next) {
    let user = this;

    if(user.isModified("password")) {
        bcrypt.genSalt(10,(err, salt) => {
            if(err){ console.log(err); next();}
            bcrypt.hash(user.password, salt, (err, hash) => {
                if(err){console.log(err); next();}
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

//Override
UserSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();

    return _.pick(userObject, ["_id", "email", "name"]);
};

UserSchema.methods.generateAuthToken = function () {
    let user = this;
    let access = "auth";
    // noinspection SpellCheckingInspection
    // noinspection SpellCheckingInspection
    let token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET||"thisisasecret").toString();

    user.tokens.push({access, token});
    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    let user = this;

    return user.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    });
};

let User = mongoose.model("User", UserSchema);

module.exports = {User};
