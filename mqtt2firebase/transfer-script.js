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

ref.once('value', (snapshot) =>{
  const data = snapshot.val();
  console.log(Object.keys(data));
  const boards = Object.keys(data)
  for (let i = 0; i < boards.length; i++) {
    console.time('a')
    const boardName = boards[i]
    if (boardName == 'new') continue
    const boardData = data[boardName];
    const targetProcess = Object.keys(boardData).length
    let proces = 0
    // const inter = setInterval(() => {
      // console.log({targetProcess, proces, perc: proces/targetProcess})
    // }, 1000);
    console.log('st')
    const newData = Object.keys(boardData).reduce((prev, cur) => {
      let mom = moment(cur, "MM-DD-YYYY-HH-mm-ss")
      prev[`new/${boardName}/${mom.format('YYYY-MM-DD')}/${mom.format('HH-mm-ss')}`] = boardData[cur]
      return prev
    }, {})
    ref.update(newData)
    console.timeEnd('a')
  }
})

  // const { dev_id, payload_fields } = JSON.parse(message.toString())
  // if (!dev_id || !payload_fields || !payload_fields.peopleCount) return

  // const date = moment()
  // ref.update({
  //   [`${dev_id}/${date.format('YYYY-MM-DD')}/${date.format('HH-mm-ss')}`]: payload_fields.peopleCount
  // })
  
  // console.log({dev_id, payload_fields, firebaseDate});
