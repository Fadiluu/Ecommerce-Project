const { MongoClient } = require('mongodb');
const url = "mongodb://127.0.0.1/"
const dbname = 'Myshopping'
const client = new MongoClient(url)
const state = {
  db: null
}

module.exports.connect = async () => {
  await client.connect()
  const db = client.db(dbname)
  state.db = db
  console.log("Database connected")
}

module.exports.get = function(){
    return state.db
}
