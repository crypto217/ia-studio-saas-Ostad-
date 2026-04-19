const { initializeApp } = require('firebase/app');
const { getFirestore, initializeFirestore, doc, getDocFromServer } = require('firebase/firestore');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);

const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, config.firestoreDatabaseId);

async function test() {
  try {
    const d = doc(db, 'test/connection');
    await getDocFromServer(d);
    console.log("Success with long polling!");
    process.exit(0);
  } catch (e) {
    if (e.message.includes('Missing or insufficient permissions')) {
       console.log("Success (permissions explicitly denied, meaning connection succeeded)!");
       process.exit(0);
    }
    console.log("Error:", e.message);
    process.exit(1);
  }
}
test();
