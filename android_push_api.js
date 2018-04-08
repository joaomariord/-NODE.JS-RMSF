'use strict';

const app = require('express')(),
    request = require('request'),
    mongo = require('mongodb'),
    bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))

const MongoClient = mongo.MongoClient

const url = process.env.MONGODB_URI || "mongodb://heroku_49mrdg0x:bkllahlbeljncb6t2vi7uojkfv@ds261088.mlab.com:61088/heroku_49mrdg0x"
const ApiKey = "AIzaSyD3IP3CN3td1rQmpnJE-20MqSlUUkNTmfY"

function SaveToken(token) {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err
        else {
            db.collection('tokens').find(token).toArray((err, found) => {
                if(found.length === 0){
                    db.collection('tokens').insertOne(token, (err, body) => {
                        if (err) throw err
                    })
                }
            })

        }
        db.close()
    })
}

const sendNotifications = (data) => {

    const dataString = JSON.stringify(data)

    const headers = {
        'Authorization': 'key=' + ApiKey,
        'Content-Type': 'application/json',
        'Content-Length': dataString.length
    }

    const options = {
        uri: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: headers,
        json: data
    }

    request(options, function (err, res, body) {
        if (err) throw err
        else console.log(body)
    })
}

const sendToAll = (msg, title, regIdArray) => {

    const data = {
        "data": {
            "body": msg,
            "title": title
        }
    }

    const folds = regIdArray.length % 1000

    for (let i = 0; i < folds; i++) {
        let start = i * 1000,
            end = (i + 1) * 1000

        data['registration_ids'] = regIdArray.slice(start, end).map((item) => {
            return item['token']
        })

        sendNotifications(data)
    }
}

const sendNotificationsOnSeverity = (severity) => {
    let title = ""
    let body = ""
    switch (severity){
        case 1: //Temperature Alert
            title = "Temperature Level is High"
            body = "Check app for more info"
            break
        case 2: //Gas Alert
            title = "Gas level is High"
            body = "Check app for more info"
            break
        case 3: //Full Alert
            title = "Both sensor levels are high"
            body = "Check your sensor"
            break
        default: //Non supposed to happen alert
            title = "Something seems off"
            body = "Check app for more info"
            break
    }

    MongoClient.connect(url, function (err, db) {
        if (err) throw err
        else {
            db.collection('tokens').find({}).toArray((err, docs) => {
                sendToAll(body, title, docs)
            })
        }
        db.close()
    })
}

module.exports = {
    SaveToken,
    sendNotificationsOnSeverity
}