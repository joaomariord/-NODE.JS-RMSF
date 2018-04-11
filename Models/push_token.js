const {mongoose} = require("./../DB/mongoose");

let TokenSchema = mongoose.Schema({
    user_id:{
        type: String,
        required: true,
        unique: true
    },
    tokens:[{
        token: {
            type: String,
            unique: false
        }
    }]

});

TokenSchema.methods.removeToken = function (token) {
    let entry = this;

    return entry.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    });
};

TokenSchema.statics.findByToken = function (token) {
    let entry = this;

    return entry.findOne({
        "tokens.token": token
    });
};

TokenSchema.statics.findByUserId= function (userId) {
    let user = this;

    return user.findOne({user_id:userId}).then( (user) => {
        if(!user) {
            return Promise.reject();
        }

        return new Promise( (resolve) => {
            return resolve(user)
        });
    });
};


TokenSchema.methods.addToken = function (token) {
    let entry = this;

    entry.tokens.push({token});
    return entry.save().then(() => {
        return token;
    });
};


let Token = mongoose.model("Token", TokenSchema);

module.exports = {Token};