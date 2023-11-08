const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cookiePerser = require('cookie-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion,ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(
  cors()
  // cors({
  //   origin: ["http://localhost:5173"],
  //   credentials : true
  // })
);
app.use(express.json())
app.use(cookiePerser())

app.get('/',(req,res) => {
    res.send('the server is starting')
})



// const veryfyToken = async (req,res,next) => {
//   const token = req.cookies.token;
//   if(!token){
//     return res
//     .status(401)
//     .send({message : 'not authorize'})
//   }
//   jwt.verify(token,process.env.ACCRESS_TOKEN_SECRET,(err ,decoded) => {
//     if(err){
//       console.log(err)
//       return res.status(401).send({message : 'Unauthorize'})
//     }
    
//     req.decoded = decoded;
//     next();

//   })
  
// }



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


    // jwt 

    app.post('/jwt',async(req,res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCRESS_TOKEN_SECRET, {
        expiresIn: "23h",
      });
      res
      .cookie('token',token,{
        httpOnly : true,
        secure : false,
      })
      .send({success : true})
    })

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
      
      let query = { email: req.query.email };
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
      // if(req.query.email !== req.decoded.email){
      //   return res.status(403).send({message :'no accress'})
      // }
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

    // accept 

    app.patch('/bidstatus',async(req,res) => {
      const id = req.query.id;
      const query = {_id:new ObjectId(id)};
      const {newstatus} = req.body;
      const updateStataus = {
        $set : {
          status : newstatus,
        }
      }

      const result = await jobBidsDB.updateOne(query,updateStataus);
      res.send(result)

    })


    // my bids delete 

    app.delete('/deletemybid',async(req,res) => {
      const id = req.query.id;
      const query = {_id:new ObjectId(id)};
      const result = await jobBidsDB.deleteOne(query);
      res.send(result);
    })

    app.get('/sortingdata',async(req,res) => {
      
      const { accepted, pending, emailid } = req.query;
        const statusOrder = [accepted, pending];
        const query = { email: emailid };
        const result = await jobBidsDB.find(query).toArray();
        const resultdata = result.sort(
          (a, b) =>
            statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
        );
        return res.send(resultdata);
      
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