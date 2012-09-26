/* Mock database
Replace with a real one
----------------------------------------*/
function avg (points) {
  return points.reduce(function (m,next){ return m + next}) / points.length
}

var Item = function (uid) {
  this.uid = uid
  this.avg = 0
  this.points = []
}

Item.prototype = {
  rate: function (point) {
    this.points.push(parseInt(point))
    this.avg = avg(this.points)
    return this
  },
  
  toJSON: function () {
    return {
      rating: this.avg,
      uid: this.uid,
      ratings_count: this.points.length
    }
  }
}

var Account = function (account_key) {
  this.account_key = account_key
  this.items = {}
}

Account.prototype = {
  addRating: function (rating, fn) {
    var item = this.items[rating.uid] || new Item(rating.uid)
    item.rate(rating.rating)
    this.items[rating.uid] = item
    fn(null, item)
  },
  
  allItems: function (fn) {
    var r = []
    for(var i in this.items) {
      r.push(this.items[i])
    }
    fn(null, r)
  },
  
  allItemsByUids: function (uids, fn) {
    console.log('find', uids, this.items)
    var self = this,
        items = [];
    uids.forEach(function (uid) {
      var i;
      if(i = self.items[uid]) items.push(i)
    })
    fn(null, items)
  },
  
  toJSON: function () {
    return {
      key: this.account_key,
      items_count: Object.keys(this.items).length,
      href: "/"+this.account_key+"/ratings"
    }
  }
}

var DB = function () {
  this.accounts = {}
}

DB.prototype = {
  findAccount: function (account_key, fn) {
    var account = this.accounts[account_key]
    
    if(!account) {
      account = this.accounts[account_key] = new Account(account_key)
    }
    
    fn(null, account)
  },
  
  allAccounts: function (fn) {
    var accounts = []
    for(var i in this.accounts) {
      accounts.push(this.accounts[i])
    }
    fn(null, accounts)
  }
}

DB.create = function () {
  return new DB()
}

module.exports = DB