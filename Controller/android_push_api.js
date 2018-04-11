'use strict';

const request = require('request')

const ApiKey = "AIzaSyD3IP3CN3td1rQmpnJE-20MqSlUUkNTmfY"

const sendNotifications = (notification) => {

    const dataString = JSON.stringify(notification)

    const headers = {
        'Authorization': 'key=' + ApiKey,
        'Content-Type': 'application/json',
        'Content-Length': dataString.length
    }

    const options = {
        uri: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: headers,
        json: notification
    }

    request(options, function (err, res, body) {
        if (err) throw err
        else console.log(body)
    })
}

const sendData = (_data, regIdArray) => {

    const data = {
        "data": _data
    }

    const folds = regIdArray.length % 1000

    for (let i = 0; i < folds; i++) {
        let start = i * 1000,
            end = (i + 1) * 1000

        data['registration_ids'] = regIdArray.slice(start, end)
        if(data.registration_ids.length !== 0) sendNotifications(data)
    }
}

module.exports = {
    sendData
}