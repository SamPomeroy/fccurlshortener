require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('morgan')
const app = express();
const {MongoClient} = require('mongodb');
const urlparser = require('url')
const dns = require('dns')

const client = new MongoClient(process.env.MONGO_URL)
const db = client.db('urlshortener')
const urls = db.collection('urls')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(logger('dev'))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
// app.get('/new', (req, res)=>{
//   console.log('hello')
// })
// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  console.log(req.body)
  const url = req.body.url
  const dnslookup = dns.lookup(urlparser.parse(url).hostname,
async (err, address)=>{
  if(!address){
    res.json({error: 'Invalid URL'})
  }else {

    const urlCount = await urls.countDocuments({})
    const urlDoc = {
      url, 
      short_url: urlCount
    }
    const result = await urls.insertOne(urlDoc)
    console.log(result)
    res.json({original_url: url, short_url: urlCount})

  }
})
});

app.get('/api/short_url/:short_url', async (req, res)=>{
  const shorturl = req.params.short_url
  const urlDoc = await urls.findOne({short_url: +shorturl})
  res.redirect(urlDoc.url)
})

app.listen(3000, function() {
  console.log(`Listening on port ${port}`);
});
