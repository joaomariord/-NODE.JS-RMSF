
const express = require('express');
const bodyParser = require('body-parser');
const ttn_interface = require("./ttn_interface");
const _ = require("lodash");
const authenticate = require("./Middleware/authenticate").authenticate;

const {User} = require("./Models/user");
const {Token} = require("./Models/push_token");
const {TTNModel} = require("./Models/ttn_devices")

let app = express();
const PORT = process.env.PORT || 80;


app.use('/', express.static('public'));

app.use(bodyParser.json());

app.post("/device/thr/gas", authenticate, async (req, res) => { //Set the new threshold for gas
    //redirect to ttn based on account info -> (appID, appKey, deviceID), appID and/or deviceID are given in the request, along with the set parameter
    ttn_interface.send_message("gas", req.body.set);
  res.status(200).send();
});

app.post("/device/thr/temp", authenticate, async (req, res) => { //Set the new threshold for temperatures
  ttn_interface.send_message("temperature", req.body.set);
  res.status(200).send();
});

app.post("/device/set/alrt", authenticate, async (req, res) => { //Set the on or off state of the buzzer alarm
  ttn_interface.send_message("alert", req.body.set);
  res.status(200).send();
});

app.post("/device/set/wtr", authenticate, async (req, res) => { //Set the on or off state of the water pump
  ttn_interface.send_message("water", req.body.set);
  res.status(200).send();
});

app.get("/status", (req, res) => { //Get the most updated status of temperature, gas, alarm and pump
    res.send(ttn_interface.get_status());
});

app.post('/store', (req, res) => { //TODO: Change or deprecate
  try{
    //push.SaveToken(req.body)
    res.status(200).send()
  } catch (error) {
    res.status(400).send()
    console.error(error)
  }
})

//AUTH ROUTES
//Registers a user with name, email and password
app.post("/register", async (req, res) =>{
    try {
        const new_user = _.pick(req.body, ["email","password","name"]);
        const user = new User(new_user);
        await user.save();
        res.send(user);
    } catch (e) {
        res.status(400).send(_.pick(e, "errmsg"));
    }
});

//Logs in a user, sends him is user name and email. Associates the given Push token with this account
app.post("/login", async (req, res) =>{
    try {
        const user_req = _.pick(req.body, ["email", "password"]);
        const user = await User.findByCredentials(user_req.email, user_req.password);
        const token = await user.generateAuthToken();

        const push_req_token = _.pick(req.body, "token_push").token_push;

        //If there is a token somewhere delete it
        try {
            const tokenToDelete = await Token.findByToken(push_req_token);
            await tokenToDelete.removeToken(push_req_token);
            console.log("Token Removed")
        } catch (e){
            console.log("Cannot delete token: " + e)
        }

        //Now put it in our new user
        try {
            const OldUser = await Token.findByUserId(_.pick(user, "_id")._id);
            await OldUser.addToken(push_req_token)
            console.log("Token added to user")
        } catch (e){ //User dont exists: Create a new entry
            console.log("Cannot add token to user: " + e);
            const push_token = new Token({
                user_id:user._id,
                tokens:[
                    {token:push_req_token}
                ]
            });
            await push_token.save();
            console.log("New entry created");
        }

        res.header("x-auth", token).send(user);
    } catch (e) {
        console.log(e)
        res.status(400).send();
    }
});

//Logs out: Delete his session token, delete Push Token
app.post("/logout", authenticate, async (req,res) => {
    try {
        await req.user.removeToken(req.token); //Delete session token
        const push_req_token = _.pick(req.body, "token_push").token_push;
        try {
            const tokenToDelete = await Token.findByToken(push_req_token);//Delete push_token if there is one
            await tokenToDelete.removeToken(push_req_token);
            console.log("Token Removed")
        } catch (e){
            console.log("Cannot delete token: " + e)
        }

        res.status(200).send();
    } catch (e) {
        res.status(400).send();
    }
});

//APPLICATION AND DEVICE ROUTES
//Creates an application associated to his account
app.post("/application", authenticate , async (req, res) =>{
    const user_id= _.pick(req.user, "_id")._id.toString();
    try {
        const ttn_entry = await TTNModel.findByUserId(user_id)
        if(ttn_entry.applications.findIndex((each) =>{return each.appID === req.body.appID}) === -1) { //There is no application equal to that one
            console.log("Creating App")
            ttn_entry.addApplication(req.body.appID, req.body.appKey)
            res.send({appID:req.body.appID, appKey:req.body.appKey})
            console.log("App created")
        }
        else {
            res.status(409).send()
            console.log("App already present")
        }
    }
    catch (e) {
        console.log("Cannot find user entry: " + e)
        console.log("Creating entry")
        try {
            const newEntry = new TTNModel({user_id:req.user._id,
                    applications:[]})
            await newEntry.save()
            console.log("New Entry Created")
            await newEntry.addApplication(req.body.appID, req.body.appKey)
            console.log("New Entry filled")
            res.send({appID:req.appID, appKey:req.appKey})
        } catch (e) {
            console.log("Failed to create or fill new entry: " + e)
            res.status(400).send(e)
        }
    }

});

//Creates a device associated to his account
app.post("/device", authenticate , async (req, res) =>{
    const user_id= _.pick(req.user, "_id")._id.toString();
    let index = -1;
    try {
        const ttn_entry = await TTNModel.findByUserId(user_id)
        if((index = ttn_entry.applications.findIndex((each) =>{return each.appID === req.body.appID})) === -1) { //There is no application equal to that one
            console.log("App not created before device")
            res.status(400).send({msg: "Please add a app first"})
        }
        else {
            console.log("App present, adding device")
            try {
                if(ttn_entry.applications[index].devices.findIndex((each)=>{ return each.deviceID === req.body.deviceID}) === -1){ //Device not present, add
                    await ttn_entry.addDevice(req.body.appID, req.body.deviceID)
                    res.send({appID:req.body.appID, appKey:req.body.deviceID})
                    console.log("Device added")
                }else {
                    res.status(409).send()
                    console.log("Device already present")
                }
            } catch (e){
                console.log("Cannot add device: "+e)
                res.status(400).send()
            }
        }
    }
    catch (e) {
        console.log("Cannot find user entry: " + e)
        res.status(400).send({msg: "Please add a app first"})
    }
});

//Deletes a app and children
app.delete("/application", authenticate ,async (req, res) =>{
    const user_id= _.pick(req.user, "_id")._id.toString();
    try {
        const ttn_entries = await TTNModel.findAllByAppID(req.body.appID)
        let index = ttn_entries.findIndex(each => each.user_id === user_id)
        const ttn_entry_to_remove = ttn_entries[index]
        await ttn_entry_to_remove.removeApplication(req.body.appID)
        res.status(200).send({appID: req.body.appID})
        console.log("App removed")
    }catch (e){
        console.log("App was not removed: "+e)
        res.status(400).send(e)
    }
});

//Deletes a device
app.delete("/device", authenticate , async (req, res) =>{
    const user_id= _.pick(req.user, "_id")._id.toString();
    try {
        const ttn_entries = await TTNModel.findAllByAppID(req.body.appID)
        let index = ttn_entries.findIndex(each => each.user_id === user_id)
        const ttn_entry_to_remove = ttn_entries[index]
        await ttn_entry_to_remove.removeDevice(req.body.appID, req.body.deviceID)
        res.status(200).send({appID: req.body.appID, deviceID: req.body.deviceID})
        console.log("Device removed")
    }catch (e){
        console.log("Device was not removed: "+e)
        res.status(400).send(e)
    }
});

//Gets application info
app.get("/application", authenticate, async (req, res) =>{
    const user_id= _.pick(req.user, "_id")._id.toString();
    try {
        const ttn_entries = await TTNModel.findAllByAppID(req.query.appID)
        let index = ttn_entries.findIndex(each => each.user_id === user_id)
        const ttn_entry_to_send = ttn_entries[index]
        const appIndex = ttn_entry_to_send.applications.findIndex(each => each.appID === req.query.appID)
        res.status(200).send(ttn_entry_to_send.applications[appIndex])
        console.log("Application data sent")
    }catch (e){
        console.log("Application not found: "+e)
        res.status(400).send(e)
    }
});

//Gets device info
app.get("/device",authenticate, async (req, res) =>{
    const user_id= _.pick(req.user, "_id")._id.toString();
    try {
        const ttn_entries = await TTNModel.findAllByDeviceID(req.query.deviceID)
        let index = ttn_entries.findIndex(each => each.user_id === user_id)
        const ttn_entry_to_send = ttn_entries[index]
        let deviceIndex = -1, appIndex = -1
        for( let each of ttn_entry_to_send.applications){
            appIndex ++
            deviceIndex = each.devices.findIndex(each => each.deviceID === req.query.deviceID)
            if(deviceIndex !== -1) break
        }
        if (appIndex > ttn_entry_to_send.applications.length) appIndex = -1

        res.status(200).send(ttn_entry_to_send.applications[appIndex].devices[deviceIndex])
        console.log("Device data sent")
    }catch (e){
        console.log("Device not found: "+e)
        res.status(400).send(e)
    }
});

app.listen(PORT, () => {
  console.log("Started on port " + PORT);
});

ttn_interface.initialize();

module.exports = {app};