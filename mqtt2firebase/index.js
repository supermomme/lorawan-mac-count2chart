var admin = require("firebase-admin");
var moment = require('moment')

// Fetch the service account key JSON file contents
var serviceAccount = require("./serviceAccount.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://maccount-e3d11-default-rtdb.europe-west1.firebasedatabase.app"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref("/");



var mqtt = require('mqtt')
var ttnAuthentication = require("./ttnAuthentication.json");

var client  = mqtt.connect('mqtt://eu.thethings.network', ttnAuthentication)



client.on('connect', function () {
  client.subscribe('+/devices/+/up')
})

client.on('message', function (topic, message) {
  const { dev_id, payload_fields } = JSON.parse(message.toString())
  if (!dev_id || !payload_fields || !payload_fields.peopleCount) return

  const date = moment().format('MM-DD-YYYY-HH-mm-ss');
  ref.update({
    [`${dev_id}/${date}`]: payload_fields.peopleCount
  })

  console.log({dev_id, payload_fields, date});
  // client.end()
})
