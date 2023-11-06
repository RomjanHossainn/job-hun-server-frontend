const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion,ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


app.get('/',(req,res) => {
    res.send('the server is starting')
})




const uri =
  `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.jciwyqv.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();


    


    
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    
  }
}
run().catch(console.dir);







app.listen(port,() => {
    console.log('the server is running')
})