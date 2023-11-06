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

    // target categorys

    const categoryesDB = client.db("categoryesDB").collection("categoryes");
    const jobsDB = client.db('jobsDB').collection('jobs')

    // category and jobs
    app.get('/categoryes',async(req,res) => {
        const result = await categoryesDB.find().toArray();
        res.send(result)
    })

    app.get("/categoryesitem",async(req,res) => {

      if (req.query.name !== "All Jobs") {
        const query = { category: req.query.name };
        const result = await jobsDB.find(query).toArray();
        res.send(result);
      }else{
        const result = await jobsDB.find().toArray();
        res.send(result);
      }
      
    });

    app.get('/alljobs',async(req,res) => {
      const result = await jobsDB.find().toArray();
      res.send(result)
    })

    app.get('/job',async(req,res) => {
      const id = req.query.id;
      const result = await jobsDB.findOne({_id:new ObjectId(id)});
      res.send(result);
    })


    // job post 

    app.post('/jobpost',async(req,res) => {
      const job = req.body;
      const result = await jobsDB.insertOne(job);
      res.send(result);
    })


    // get my job post 

    app.get('/mypostedjob',async(req,res) => {
      let query = {}
      if(req.query.email){
        query = {email:req.query.email};
      }
      const result = await jobsDB.find(query).toArray();
      res.send(result);
    })

    
    
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