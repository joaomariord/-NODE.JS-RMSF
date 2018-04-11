let ttn = require("ttn");

const push = require("./android_push_api")
const Token = require("../Models/push_token").Token;
const TTNModel = require("../Models/ttn_devices").TTNModel;

const STATUS_DEFAULT = 0;
const B_STATS_DEFAULT = false;
const THRESH_DEFAULT = 0;
const OPERATION_DEFAULT = false;

let applications_listening = []

let _internal_status = {
    temp  : {status : STATUS_DEFAULT, threshold : THRESH_DEFAULT},
    gas   : {status : STATUS_DEFAULT, threshold : THRESH_DEFAULT},
    alert : {status : B_STATS_DEFAULT, operational : OPERATION_DEFAULT},
    water : {status : B_STATS_DEFAULT, operational : OPERATION_DEFAULT}
};

//Sends a message to any device, static function
function send_message(type, message, appID, appKey, deviceID) {
    ttn.data(appID, appKey).then( (client)=> {
        let n_obj = {};
        try {
            n_obj = _encode_payload(type, message);
        } catch (err) {
            if(err.message === "TypeError") console.error("Message type not supported");
            return;
        }
        client.send(deviceID, n_obj.message, n_obj.port, false, "replace" );
        console.log("Sent downlink with message: "+n_obj.message+" to port: "+n_obj.port);
    }).catch( (e)=>{
        console.log("Error connecting to app, intending to send message" + e);
    })
}

function start_listener(appID, appKey) {
    if(applications_listening.findIndex(x => x === appID) !== -1) //If there is one application with this id
    {
        return
    }
    ttn.data(appID, appKey)
        .then((client)=>{
            applications_listening.push(appID)
            client.on("message", async (devID, payload)=>{
                //In the payload field we have access to the app_id and dev_id, so we can send the
                // push message and save the data in the respective devices

                //First get app_id and dev_id
                const appID = payload.app_id
                const deviceID = payload.dev_id

                //Now try to understand the message
                try {
                    _internal_status = _decode_payload(payload);
                }
                catch (err) {
                    if(err.message === "PortError"){
                        console.log("Received on port different from 1");
                    }
                    else if (err.message === "BadMessageError"){
                        console.log("Message badly encapsulated received");
                    }
                    return
                }

                //No errors, so status is good
                // Find each user that has this device and application registered
                try {
                    const usersArray = await TTNModel.findAllByDeviceID(deviceID)
                    let validUsersArray = usersArray.filter((user) => { //See each correspondence
                           return user.applications.findIndex(app => app.appID === appID) !== -1;
                        }).map(x=>x.user_id)
                    //From each value of validUsersArray get respective tokens to one array
                    let tokenArray = [];
                    for (let index = 0; index < validUsersArray.length; index ++){
                        const token_doc = await Token.findByUserId(validUsersArray[index])
                        if(token_doc !== undefined){
                            //tokenArray.concat(token_doc.tokens.map(x=>x.token))
                            tokenArray = tokenArray.concat(token_doc.tokens.map(x=>x.token))
                        }
                    }
                    //Send final array with information
                    push.sendData({
                        deviceID,
                        appID,
                        status: _internal_status
                    }, tokenArray)

                } catch (e) {
                    console.log("No user has device registered")
                }

                //Now fill all devices in apps with the incoming result
                try {
                    const usersArray = await TTNModel.findAllByDeviceID(deviceID)
                    usersArray.forEach(async (user) => {
                        await user.setDeviceStatus(appID,deviceID,_internal_status)
                    })
                } catch (e) {
                    console.log("Cannot add new info to devices")
                }
            })
        })
        .catch((error)=>{
            console.log("Error "+ error);
        });
}

function _decode_payload(payload) {
    //Decode payload to object
    //Fill the object with info from payload.
    console.log("Payload", payload);
    if(payload.port === 1){
        //payload_raw is buffer so we can use is methods
        let parsed_payload = JSON.parse(payload.payload_raw);
        if(
            typeof parsed_payload.temp.status     === "number"  &&
            typeof parsed_payload.temp.threshold  === "number"  &&
            typeof parsed_payload.gas.status      === "number"  &&
            typeof parsed_payload.gas.threshold   === "number"  &&
            typeof parsed_payload.water.operational === "boolean" &&
            typeof parsed_payload.water.status      === "boolean" &&
            typeof parsed_payload.alert.status      === "boolean" &&
            typeof parsed_payload.alert.operational === "boolean"
        ) return parsed_payload;
        else throw new Error("BadMessageError");
    } else {
        throw new Error("PortError");
    }
}

function _encode_payload(type, message) {
    //Encode payload to message
    switch (type) {
        case "temperature":
            //Double encoding
            if(typeof message === "number")  return {message:new Buffer(message.toString()), port:2,};
            break;
        case "gas":
            //Double encoding
            if(typeof message === "number")  return {message:new Buffer(message.toString()), port:3,};
            break;
        case "water":
            //Boolean encoding
            if(typeof message === "boolean")  return {message:new Buffer(message.toString()), port:4,};
            break;
        case "alert":
            //Boolean encoding
            if(typeof message === "boolean")  return {message:new Buffer(message.toString()), port:5,};
            break;
    }
    throw new Error("TypeError");
}

module.exports = {
    send_message:send_message,
    start_listener:start_listener
};