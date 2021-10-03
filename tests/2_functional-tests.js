const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
   suite('One get request test',()=>{
      test('Viewing one stock: GET request to /api/stock-prices/',(done)=>{
          chai.request(server)
        .get('/api/stock-prices/')
        .set('content-type','application/json')
        .query({stock:'AMZN'})
        .end((err,res)=>{
          assert.equal(res.status,200)
          assert.equal(res.body.stockData.stock,'AMZN')
          assert.exists(res.body.stockData.price,'Stock price has been returned')
          done();
        })
        
      });
      test('Viewing one stock and liking it: GET request to /api/stock-prices/',(done)=>{
          chai.request(server)
        .get('/api/stock-prices/')
        .set('content-type','application/json')
        .query({stock:'GOOG',like:'true'})
        .end((err,res)=>{
          assert.equal(res.status,200)
          assert.equal(res.body.stockData.stock,'GOOG')
           assert.equal(res.body.stockData.likes,2)
          assert.exists(res.body.stockData.price,'Stock price has been returned')
          done();
        }) 

      });
      test('Viewing the same stock and liking it again: GET request to /api/stock-prices/',(done)=>{
          chai.request(server)
        .get('/api/stock-prices/')
        .set('content-type','application/json')
        .query({stock:'GOOG',like:'true'})
        .end((err,res)=>{
          assert.equal(res.status,200)
          assert.equal(res.body.stockData.stock,'GOOG')
          assert.equal(res.body.stockData.likes,2)
          assert.strictEqual(res.body.stockData.ips,'You have already voted for this stock.Please choose another stock and tick like.')
          assert.exists(res.body.stockData.price,'Stock price has been returned')
          done();
        }) 

      });
   });
   
   suite(`Two query's get request test`,()=>{
      test('Viewing the same stock and liking it again: GET request to /api/stock-prices/',(done)=>{
          chai.request(server)
        .get('/api/stock-prices/')
        .set('content-type','application/json')
        .query({stock:['GOOG','MSFT'],like:'true'})
        .end((err,res)=>{
          assert.equal(res.status,200)
          assert.equal(res.body.stockData[0].stock,'MSFT')
          assert.equal(res.body.stockData[0].rel_likes,2)
          assert.exists(res.body.stockData[0].price,'Stock price has been returned')
          assert.equal(res.body.stockData[1].stock,'GOOG')
          assert.equal(res.body.stockData[1].rel_likes,2)
          assert.exists(res.body.stockData[1].price,'Stock price has been returned')
          done();
        }) 

      });
      test('Viewing two stocks and liking them: GET request to /api/stock-prices/',(done)=>{
          chai.request(server)
        .get('/api/stock-prices/')
        .set('content-type','application/json')
        .query({stock:['GOOG','MSFT'],like:'true'})
        .end((err,res)=>{
          console.log(res.body.stockData[0])
          assert.equal(res.status,200)
          assert.equal(res.body.stockData[0].stock,'MSFT')
          assert.equal(res.body.stockData[0].rel_likes,2)
          assert.strictEqual(res.body.stockData[0].ips,'You have already voted for this stock.Please choose another stock and tick like.')
          assert.exists(res.body.stockData[0].price,'Stock price has been returned')
          assert.equal(res.body.stockData[1].stock,'GOOG')
          assert.equal(res.body.stockData[1].rel_likes,2)
          assert.strictEqual(res.body.stockData[1].ips,'You have already voted for this stock.Please choose another stock and tick like.')
          assert.exists(res.body.stockData[1].price,'Stock price has been returned')
          done();
        }) 

      });
   })


});