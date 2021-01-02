const moment = require('moment')
const fs = require('fs')
const mqtt = require('mqtt')

// Schlüssel zur Anmeldung (nicht im Projekt im Anhang enthalten)
const ttnAuthentication = require("./ttnAuthentication.json")

const client  = mqtt.connect('mqtt://eu.thethings.network', ttnAuthentication)

client.on('connect', () => {
  client.subscribe('+/devices/+/up')
})

client.on('message', (topic, message) => {
  const { dev_id, payload_fields } = JSON.parse(message.toString())
  if (!dev_id || !payload_fields || !payload_fields.peopleCount) return

  const date = moment() // bekomme aktuelle Zeit
  
  createOrAppendFile(dev_id, date, payload_fields.peopleCount)

})

const createOrAppendFile = (boardName, momentDate, peopleCount) => {
  const filename = `./csv/${momentDate.format('DD.MM.YYYY')}-${boardName}.csv`
  if (!fs.existsSync(filename)) { // Wenn die Datei noch nicht exisitert,
    // dann erstelle die Datei und füge ein Kopf ein.
    fs.appendFileSync(filename, `Zeit;Anzahl\n`)
  }
  fs.appendFileSync(filename, `${momentDate.format('HH:mm:ss')};${peopleCount}\n`) // Füge die Daten hinzu.
}