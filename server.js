var express = require('express');

var app = express()

var db = require('./lib/db').create()

app.use(express.bodyParser())

app.use(function(req, res, next){
  console.log('req', req.params)
  res.set({'Content-Type': 'application/json'})
  next();
});

//CORS middleware
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');

    next();
})

function findAccount (req, res, next) {
  db.findAccount(req.params.app_key, function (err, account) {
    req.account = account
    next()
  })
}

app.get('/', function (req, res) {
  db.allAccounts(function (err, accounts) {
    res.send(accounts.map(function (a) {
      return a.toJSON()
    }))    
  })
})

app.get('/:app_key', findAccount, function (req, res) {
  req.account.allItems(function (err, items) {
    res.send(items.map(function (a) {
      return a.toJSON()
    }))
  })
})

app.post('/:app_key/ratings', findAccount, function (req, res) {
  
  // validate payload here
  
  req.account.addRating(req.body, function (err, item) {
    res.send(item.toJSON())
  })
  
})

app.get('/:app_key/ratings', findAccount, function(req, res) {
  
  if(!req.query.uids) {
    res.send(404, {error: "you need to pass comma-separated :uids in query string"})
    return
  }
  
  req.account.allItemsByUids(req.query.uids.split(','), function (err, items) {
    res.send(items.map(function (item) {
      return item.toJSON()
    }))
  })

});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});