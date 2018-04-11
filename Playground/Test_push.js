const {Token} = require("./../Models/push_token");
/*
let newTok = new Token({
    user_id: "55541231231",
    tokens:[{
        token:"token112323123"
    }]
})

newTok.save()

newTok = new Token({
    user_id: "5554sadsada1",
    tokens:[{
        token:"token22222222"
    }]
})

newTok.save()

newTok = new Token({
    user_id: "5554wwwwwww",
    tokens:[{
        token:"token333333333"
    }]
})
newTok.save()

*/
const ret = Token.findByToken("token22222222").then((some) => {
    some.removeToken("token22222222").then((deleted)=>{
        console.log(deleted)
    }).catch((error)=>{
        console.log("No token deleted")
    })
}).catch((error)=>{
    console.log("No match find")
});

//ret.removeToken("token333333333")


