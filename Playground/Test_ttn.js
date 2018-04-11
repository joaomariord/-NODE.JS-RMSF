const {TTNModel} = require("./../Models/ttn_devices");

const test = new TTNModel({
    user_id:"myID",
    applications:[]
});
/*
test.save().then(()=>{
    console.log("Added entry")
}).catch((e)=>{
    console.log("No entry added: " + e)
})*/
const deviceStatus = {
    temp  : {status : "TS", threshold : "TT"},
    gas   : {status : "GS", threshold : "GT"},
    alert : {status : "AS", operational : "AO"},
    water : {status : "WS", operational : "WO"}};

TTNModel.findByUserId("myID").then(async (entry)=>{
    console.log("Entry found")
    //await entry.addApplication("myApp2ID", "myAppKey1234")
    //await entry.addDevice("myApp2ID","myDevice2ID")
    //await entry.setDeviceStatus("myApp2ID", "myDevice2ID", deviceStatus)

    //await entry.removeDevice("myApp2ID","myDevice2ID")
    //await entry.removeApplication("myApp2ID")

}).catch((e)=>{
    console.log("No record found from userID: "+e)
});

TTNModel.findAllByAppID("myApp2ID").then(async (entry)=>{
    console.log("App found");
    console.log(entry)

}).catch((e)=>{
    console.log("No record found from appID: "+e)
});

TTNModel.findAllByDeviceID("myDevice2ID").then(async (entry)=>{
    console.log("Device found")
    //console.log(entry)

}).catch((e)=>{
    console.log("No record found from deviceID: "+e)
});