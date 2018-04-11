const {mongoose} = require("./../DB/mongoose");

let TTNSchema = mongoose.Schema({
    user_id:{
        type: String,
        required: true,
        unique: true
    },
    applications:[{
        appID:String,
        appKey:String,
        devices:[{
            deviceID: {
                type: String
            },
            deviceStatus:{
                temp  : {status : String, threshold : String},
                gas   : {status : String, threshold : String},
                alert : {status : String, operational : String},
                water : {status : String, operational : String}
            }
        }]
    }]
});

TTNSchema.methods.removeApplication = function (appID) {
    let entry = this;

    return entry.update({
        $pull: {
            applications: {
                appID: appID
            }
        }
    });
};

TTNSchema.methods.removeDevice = function (appID, deviceID) {
    let entry = this;

    entry.applications.forEach((app) => {
        if(app.appID === appID){
            app.devices = app.devices.filter(x => x.deviceID !== deviceID)
        }
    })
    return entry.save().then(() => {
        return deviceID;
    });
};


TTNSchema.methods.addApplication = function (appID, appKey) {
    let entry = this;

    entry.applications.push({appID,appKey,devices:[]});
    return entry.save().then(() => {
        return appID;
    });
};

TTNSchema.methods.addDevice = function (appID, deviceID) {
    let entry = this;

    entry.applications.forEach((app) => {
        if(app.appID === appID){
            app.devices.push({deviceID,deviceStatus:{
                    temp  : {},
                    gas   : {},
                    alert : {},
                    water : {}
                }})
        }
    })
    return entry.save().then(() => {
        return appID;
    });
};

TTNSchema.methods.setDeviceStatus = function (appID, deviceID, deviceStatus) { //TODO: Maybe optimize the search
    let entry = this;

    entry.applications.forEach((app) => {
        if(app.appID === appID){
            app.devices.forEach((device)=>{
                if(device.deviceID === deviceID){
                    device.deviceStatus.alert.operational = deviceStatus.alert.operational
                    device.deviceStatus.alert.status = deviceStatus.alert.status
                    device.deviceStatus.gas.threshold = deviceStatus.gas.threshold
                    device.deviceStatus.gas.status = deviceStatus.gas.status
                    device.deviceStatus.water.operational = deviceStatus.water.operational
                    device.deviceStatus.water.status = deviceStatus.water.status
                    device.deviceStatus.temp.threshold = deviceStatus.temp.threshold
                    device.deviceStatus.temp.status = deviceStatus.temp.status
                }
            })
        }
    })
    return entry.save().then(() => {
        return appID;
    });
};

TTNSchema.statics.findAll= function () {
    return this.find({}).then( (all) => {
        if(!all) return Promise.reject()
        return new Promise( (resolve => resolve(all)))
    });
};

TTNSchema.statics.findByUserId= function (userId) {
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

TTNSchema.statics.findAllByAppID= function (appID) {
    let ttn = this;

    return ttn.find({"applications.appID":appID}).then( (appArray) => {
        if(appArray.length === 0) {
            return Promise.reject();
        }

        return new Promise( (resolve) => {
            return resolve(appArray)
        });
    });
};

TTNSchema.statics.findAllByDeviceID= function (deviceID) {
    let ttn = this;

    return ttn.find({"applications.devices.deviceID":deviceID}).then( (deviceArray) => {
        if(deviceArray.length === 0) {
            return Promise.reject();
        }

        return new Promise( (resolve) => {
            return resolve(deviceArray)
        });
    });
};


let TTNModel = mongoose.model("TTNModel", TTNSchema);

module.exports = {TTNModel};