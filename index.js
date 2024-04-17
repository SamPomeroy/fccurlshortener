require('dotenv').config();
const express = require('express');
const cors = require('cors');
const littleid = require('littleid');
const app = express();

// Basic Configuration
const port = 3000;

app.use(cors());
app.use(express.urlencoded({extended: true})
);
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
let urlArray = []
app.post('/api/shorturl', function(req, res) {
    try {
      
      const url = req.body.url
      let valid = url.startsWith('http://') || url.startsWith('https://')
      if(!valid){
        res.json({error: 'invalid url'})
        return
      }
      let short_url = littleid()
      let foundUrl = urlArray.find((item) => item.original_url === url)
      if(foundUrl){
        res.json({original_url: foundUrl.original_url, short_url: foundUrl.short_url})
        return
      }
      else {
        urlArray.push({original_url: url, short_url: short_url})
        res.json({original_url: url, short_url: short_url})
        return
      }
    } catch (error) {
      res.json({error: 'invalid url'})
    }

})

app.get('/api/shorturl/:short_url?', function(req, res) {
  try {
    let found = urlArray.find((item) => item.short_url === req.params.short_url)
    if(found){
      res.redirect(found.original_url)
      return
    }
  } catch (error) {
    res.json({error: 'invalid url'})

  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});