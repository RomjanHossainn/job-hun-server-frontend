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
    const jobsDB = client.db('jobsDB').collection('jobs');
    const jobBidsDB = client.db("jobBidsDB").collection('jobsbids');

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


    // updatejob

    app.put('/updatejob',async(req,res) => {
      const id = req.query.id;
      const newJobs = req.body;
      const {min_salary,
        max_salary,
        job_title,
        location,
        jobType,
        category,
        dead_line,
        email,
        description,} = newJobs || {}
      console.log(newJobs)
      const filter = {_id:new ObjectId(id)}
      const updateJob = {
        $set: {
          min_salary,
          max_salary,
          job_title,
          location,
          jobType,
          category,
          dead_line,
          email,
          description,
        },
      };
      const result = await jobsDB.updateOne(filter,updateJob);
      res.send(result);
    })


    // job delete 

    app.delete('/jobdelete',async(req,res) => {
      const id = req.query.id;
      const query = {_id:new ObjectId(id)};
      const result = await jobsDB.deleteOne(query);
      res.send(result);
      
    })


    // post bids job 
    app.post('/postbidsjob',async(req,res) => {
      const bidsData = req.body;
      const result = await jobBidsDB.insertOne(bidsData);
      res.send(result);
    })

    // get bids job 

    app.get("/yourbidsjobs",async(req,res) => {
      const query = {email : req.query.email}
      const result = await jobBidsDB.find(query).toArray();
      res.send(result);
    });


    // get buyer email job 

    app.get('/buyeremailjobs',async(req,res) => {
      const query = {buyeremail : req.query.email};
      const result = await jobBidsDB.find(query).toArray();
      res.send(result)
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