let ttn = require("ttn");

const push = require("./android_push_api")

const STATUS_DEFAULT = 0;
const B_STATS_DEFAULT = false;
const THRESH_DEFAULT = 0;
const OPERATION_DEFAULT = false;

const appId = process.env.ttn_app_id || "nodejs_ttn-test";
const accessKey = process.env.ttn_access_key || "ttn-account-v2.pQHDNoiLYjcG8_yiizN53nw4l0tSjtR2Yi-5ANEQa9k";
const nodeID = process.env.ttn_device_id || "my_device";

let _internal_status = {
    temp  : {status : STATUS_DEFAULT, threshold : THRESH_DEFAULT},
    gas   : {status : STATUS_DEFAULT, threshold : THRESH_DEFAULT},
    alert : {status : B_STATS_DEFAULT, operational : OPERATION_DEFAULT},
    water : {status : B_STATS_DEFAULT, operational : OPERATION_DEFAULT}
};

function send_message(type, message) {
    ttn.data(appId, accessKey).then( (client)=> {
        let n_obj = {};
        try {
            n_obj = _encode_payload(type, message);
        } catch (err) {
            if(err.message === "TypeError") console.error("Message type not supported");
            return;
        }
        client.send(nodeID, n_obj.message, n_obj.port, false, "replace" );
        console.log("Sent downlink");
    }).catch( (e)=>{console.error("Error", e); process.exit(1)} )
}

function start_listener() {
    ttn.data(appId, accessKey)
        .then((client)=>{
            client.on("message", (devID, payload)=>{
                let severity = 0
                try {
                    _internal_status = _decode_payload(payload);
                    severity = isAboveThreshold()
                    if(severity>0)
                        push.sendNotificationsOnSeverity(severity)
                }
                catch (err) {
                    if(err.message === "PortError"){
                        console.log("Received on port different from 1");
                    }
                    else if (err.message === "BadMessageError"){
                        console.log("Message badly encapsulated received");
                    }
                }
            })
        })
        .catch((error)=>{
            console.error("Error", error);
            process.exit(1)
        });
}

function get_status() {
    //Return status object
    return _internal_status;
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


// Severity Levels : 0 -> None; 1 -> temperature alert; 2 -> gas alert; 3 -> Full Alert
function isAboveThreshold() {
    let severityLevel = 0
    if(_internal_status.temp.status > _internal_status.temp.threshold){
        severityLevel += 1
    }
    if(_internal_status.gas.status > _internal_status.gas.threshold){
        severityLevel += 2
    }
    return severityLevel

}

module.exports = {
    send_message:send_message,
    initialize:start_listener,
    get_status:get_status,
};