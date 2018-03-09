var ttn = require("ttn");

var appId = "nodejs_ttn-test"
var accessKey = "ttn-account-v2.pQHDNoiLYjcG8_yiizN53nw4l0tSjtR2Yi-5ANEQa9k"

ttn.data(appId, accessKey)
  .then((client)=>{
    client.on("message",(devID, payload)=>{
      console.log("Received uplink from:", devID)
      console.log(payload)
    })
  })
  .catch((error)=>{
    console.error("Error", error)
    process.exit(1)
  })
