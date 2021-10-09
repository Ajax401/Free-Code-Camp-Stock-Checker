'use strict';
const mongodb = require('mongodb')
const mongoose = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const stockData = require('../models/mySchema.js')

const MONGODB_CONNECTION_STRING = process.env.DB;
module.exports = function (app) {
  mongoose.connect( MONGODB_CONNECTION_STRING, { useNewUrlParser: true })
 .then(() => console.log("MongoDb connected"))
 .catch(err => console.log(err));
  app.route('/api/stock-prices')
    .get(function (req, res){
      let { stock, like } = req.query;
      let ip = req.ip.slice(7,13);
      if(Array.isArray(stock)){
      let  stockOne = stock[0],
           stockTwo = stock[1];
      async function responseTwo() {
        const [url, url1] = await Promise.all([
        fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockOne}/quote`),
        fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockTwo}/quote`)
        ]);

       const inquire = await url.json();
       const inquire1 = await url1.json();

       return [inquire, inquire1];
      }

     responseTwo().then(([data, data1]) => {
     
     let myVal = data.symbol,
         myVal1 = data1.symbol,
         currentPrice = data.latestPrice,
         currentPrice1 = data1.latestPrice,
         viewLike = 0,
         findMe = {stock:myVal},
         findMe1 = {stock:myVal1},
         myIp = {ips:ip};
         like == 'true'?viewLike=1:viewLike;
         

   stockData.exists(findMe,findMe1).then(check =>{
      
       if(!myVal&&!myVal1){

         res.status(200).json({
          stockData:[{error:`erorr no stock named ${stockOne} in database`},{error:`erorr no stock named ${stockTwo} in database`}]
          })
         
       }

      if(check&&!like){

        if(myVal&&myVal1){
            
          async function double () {
        
             const res = await stockData.bulkWrite([
              { 
               updateOne: {
                filter: {
                  stock: myVal
                  },
                update: {
                 $set: {
                  price:currentPrice
                  }
                      }
                        }
                },
               { 
               updateOne: {
                filter: {
                  stock: myVal1
                        },
                  update: {
                $set: {
                  price:currentPrice1
                      }
                        } 
                 }
                }
              ]);
              
              
              return res; 
            }
            double().then(data =>{
            
            stockData.find({stock:{$in:[myVal,myVal1]}}).then(data =>{
              
              let relLikes = data[0].likes,
                  relLikes1 = data[1].likes,
                  differentLikes,
                  differentLikes1;
                  relLikes < relLikes1?differentLikes = relLikes - relLikes1:differentLikes = relLikes;
                  relLikes1 < relLikes?differentLikes1 = relLikes1 - relLikes:differentLikes1 = relLikes1;
            res.status(200).json({
              stockData:[{stock:data[0].stock,price:data[0].price,rel_likes:differentLikes},{stock:data[1].stock,price:data[1].price,rel_likes:differentLikes1}]
              })
            })
         })
        }

        if(myVal&&!myVal1){
          stockData.findOne(findMe).then(data =>{
         res.status(200).json({
        stockData:[{stock:data.stock,price:currentPrice,likes:data.likes},{error:`erorr no stock named ${stockTwo} in database`}]
        })
       })
        }

       if(!myVal&&myVal1){
        stockData.findOne(findMe1).then(data =>{
         res.status(200).json({
        stockData:[{error:`erorr no stock named ${stockOne} in database`},{stock:data.stock,price:currentPrice1,rel_likes:data.likes}]
        })
       })
       }
      
      }



      if(check&&like == 'false'){

        if(myVal&&myVal1){
          async function double () {
      
             const res = await stockData.bulkWrite([
              { 
               updateOne: {
                filter: {
                  stock: myVal
                  },
                update: {
                 $set: {
                  price:currentPrice
                  }
                      }
                        }
                },
               { 
               updateOne: {
                filter: {
                  stock: myVal1
                        },
                  update: {
                $set: {
                  price:currentPrice1
                      }
                        } 
                 }
                }
              ]);
              
              
              return res; 
            }
            double().then(data =>{
            stockData.find({stock:{$in:[myVal,myVal1]}}).then(data =>{
              
              let relLikes = data[0].likes,
                  relLikes1 = data[1].likes,
                  differentLikes,
                  differentLikes1;
                  relLikes < relLikes1?differentLikes = relLikes - relLikes1:differentLikes = relLikes;
                  relLikes1 < relLikes?differentLikes1 = relLikes1 - relLikes:differentLikes1 = relLikes1;
            res.status(200).json({
              stockData:[{stock:data[0].stock,price:data[0].price,rel_likes:differentLikes},{stock:data[1].stock,price:data[1].price,rel_likes:differentLikes1}]
              })
            })
         })
        }

       if(!myVal&&myVal1){
        stockData.findOne(findMe1).then(data =>{
         res.status(200).json({
        stockData:[{error:`erorr no stock named ${stockOne} in database`},{stock:data.stock,price:currentPrice1,rel_likes:data.likes}]
        })
       })
       }

      }
     
      
     
     if(!check&&myVal&&myVal1&&like == 'true'){
           let firstStock = {
           stock:myVal,
            price:currentPrice,
            likes:viewLike,
            ips:[ip]
           };

         let secondStock = {
          stock:myVal1,
          price:currentPrice,
          likes:viewLike,
          ips:[ip]

         }

        let stocks = [firstStock,secondStock]

        stockData.insertMany(stocks).then(data =>{
      
         res.status(200).json({
           stockData:[{stock:data[0].stock,price:data[0].price,rel_likes:viewLike},{stock:data[1].stock,price:data[1].price,rel_likes:viewLike}]
        })
      
        
        })
     }

     if(!check&&like == 'false'){

      if(myVal&&myVal1){
       let firstStock = {
           stock:myVal,
           price:currentPrice,
           likes:viewLike
       };

       let secondStock = {
          stock:myVal1,
          price:currentPrice1,
          likes:viewLike
      }

      let stocks = [firstStock,secondStock]

      stockData.insertMany(stocks).then(data =>{
      
        res.status(200).json({
           stockData:[{stock:data[0].stock,price:currentPrice,rel_likes:viewLike},{stock:data[1].stock,price:currentPrice1,rel_likes:viewLike}]
        })
      })
      }

      if(myVal&&!myVal1){
         let myStock = new stockData({
              stock:myVal,
              price:currentPrice,
              likes:viewLike,
              ips:[]
          })
          myStock.save((err,info)=>{
            res.status(200).json({
             stockData:[{stock:info.stock,price:currentPrice,rel_likes:info.likes},{error:`erorr no stock named ${stockTwo} in database`}]
            })
          })
      }

      if(!myVal&&myVal1){
         let myStock = new stockData({
              stock:myVal1,
              price:currentPrice1,
              likes:viewLike,
              ips:[]
          })
          myStock.save((err,info)=>{
            res.status(200).json({
              stockData:[{error:`erorr no stock named ${stockOne} in database`},{stock:info.stock,price:currentPrice1,rel_likes:info.likes}]
            })
          })
      }
      
     }
      
    if(check&&like == 'true'){

      if(myVal&&myVal1){
        
        stockData.exists({stock:[myVal,myVal1],ips:ip}).then(info =>{
        
          if(info){
               async function double () {
      
             const res = await stockData.bulkWrite([
              { 
               updateOne: {
                filter: {
                  stock: myVal
                  },
                update: {
                 $set: {
                  price:currentPrice
                  }
                      }
                        }
                },
               { 
               updateOne: {
                filter: {
                  stock: myVal1
                        },
                  update: {
                $set: {
                  price:currentPrice1
                      }
                        } 
                 }
                }
              ]);
              
              
              return res; 
            }
            double().then(data =>{
                 console.log(data[1]);
                stockData.find({stock:{$in:[myVal,myVal1]}}).then(data =>{
              let relLikes = data[0].likes,
                  relLikes1 = data[1].likes,
                  differentLikes,
                  differentLikes1;
                 relLikes<relLikes1?differentLikes = relLikes - relLikes1:differentLikes = relLikes;
                 relLikes1<relLikes?differentLikes1 = relLikes1 - relLikes:differentLikes1 = relLikes1;
            res.status(200).json({
              stockData:[{stock:data[0].stock,price:data[0].price,rel_likes:differentLikes, ips:"You have already voted for this stock.Please choose another stock and tick like."},{stock:data[1].stock,price:data[1].price,rel_likes:differentLikes1, ips:"You have already voted for this stock.Please choose another stock and tick like."}]
              })
            })
            })
          }

          if(!info){
      
            async function double () {
           
             const res = await stockData.bulkWrite([
              { 
               updateOne: {
                filter: {
                  stock: myVal
                  },
                update: {
                 $set: {
                  price:currentPrice
                  },
                $inc:{
                  likes:viewLike
                  },
                $addToSet:{
                  ips:ip
                  }
                      }
                        }
                },
               { 
               updateOne: {
                filter: {
                  stock: myVal1
                        },
                  update: {
                $set: {
                  price:currentPrice1
                      },
                $inc:{
                 likes:viewLike
                    },
                $addToSet:{
                  ips:ip
                    }
                        } 
                 }
                }
              ]);
              
              return res; 
            }
            double().then(data =>{
           
              stockData.find({stock:[myVal,myVal1]}).then(data =>{
              
              let relLikes = data[0].likes,
                  relLikes1 = data[1].likes,
                  differentLikes,
                  differentLikes1;
                  relLikes<relLikes1?differentLikes = relLikes - relLikes1:differentLikes = relLikes;
                  relLikes1<relLikes?differentLikes1 = relLikes1 - relLikes:differentLikes1 = relLikes1;
                  
                  res.status(200).json({
                    stockData:[{stock:data[0].stock,price:data[0].price,rel_likes:differentLikes},{stock:data[1].stock,price:data[1].price,rel_likes:differentLikes1}]
                    })
            })
              });
           
          }



        })
      }

      if(myVal&&!myVal1){
        let update ={
               $set:{
                price:currentPrice
               },
               $inc:{
               likes:viewLike
               },
               $addToSet:{
                 ips:ip
               }
               }

         stockData.exists({stock:myVal,ips:ip}).then(info =>{
             if(!info){
               stockData.findOneAndUpdate(findMe,update,{new:true}).then(data =>{
            //console.log(data.ips)
             res.status(200).json({
                 stockData:[{stock:data.stock,price:currentPrice,rel_likes:data.likes},{error:`erorr no stock named ${stockTwo} in database`}]
               })
             
           })
             }
             
             if(info){
                let update ={
               $set:{
                price:currentPrice
               }
               }
               stockData.findOneAndUpdate({stock:myVal,ips:ip},update,{new:true}).then(data =>{
                  //console.log(data.ips)  
                  res.status(200).json({
                  stockData:[{stock:data.stock,price:currentPrice,rel_likes:data.likes},{error:`erorr no stock named ${stockTwo} in database`}]
               })
               })
             }
             
           }) 

      }

      if(!myVal&&myVal1){
        let update ={
               $set:{
                price:currentPrice1
               },
               $inc:{
               likes:viewLike
               },
               $addToSet:{
                 ips:ip
               }
               }

         stockData.exists({stock:myVal1,ips:ip}).then(info =>{
             if(!info){
               stockData.findOneAndUpdate(findMe1,update,{new:true}).then(data =>{
            //console.log(data.ips)
             res.status(200).json({
                  stockData:[{error:`erorr no stock named ${stockOne} in database`},{stock:data.stock,price:currentPrice1,rel_likes:data.likes}]
               })
             
           })
             }
             
             if(info){
                let update ={
               $set:{
                price:currentPrice1
               }
               }
               stockData.findOneAndUpdate({stock:myVal1,ips:ip},update,{new:true}).then(data =>{
                  //console.log(data.ips)  
                  res.status(200).json({
                   stockData:[{error:`erorr no stock named ${stockOne} in database`},{stock:data.stock,price:currentPrice1,rel_likes:data.likes}]
               })
               })
             }
             
           }) 

      }

    }

   })

    }).catch(err => 
    console.log("could not load data due to "+ err)
    );
    }
    if(!Array.isArray(stock)){
        let { stock, like } = req.query;
        let ip = req.ip.slice(7,13);
      async function response (){
      const url = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
      const inquire = await url.json();
      return inquire
     }
     response().then(data =>{
         let viewLike = 0,
             myVal = data.symbol,
             currentPrice = data.latestPrice;
         like == 'true'?viewLike=1:viewLike;
         let findMe = {stock:myVal};
        

        stockData.exists(findMe).then(check =>{
        //console.log(like)
         if(!check&&!like){
             res.json({stockdata:{error:`erorr no stock named ${stock} in database`}})
          }

         if(check&&!like){
          if(myVal){
           stockData.findOne(findMe).then(data=>{
             res.status(200).json({
                stockData:{
                  stock:data.stock,
                  price:currentPrice,
                  likes:data.likes
                }
             })
           })
          }
          

         }
        else if(check&&like == 'false'){
          let update = {
            $set:{
              price:currentPrice
            }
          }
          stockData.findOneAndUpdate(findMe,update,{new:true}).then(data =>{
           //console.log(data.ips)
            res.status(200).json({
               stock:data.stock,
               price:currentPrice,
               likes:data.likes
            })
          })
          } 
          
          if(!myVal&&like == 'false'){
          res.json({stockdata:{error:`erorr no stock named ${stock} in database`}})
        } 
        
         if(!check&&myVal&&like == 'false'){
        
            let myStock = new stockData({
              stock:myVal,
              price:currentPrice,
              likes:viewLike,
              ips:[]
          })
          myStock.save((err,info)=>{
    
            res.status(200).json({
              stock:myVal,
              price:currentPrice,
              likes:viewLike
            })
          })
          }
         
        if(!myVal&&like == 'true'){
          res.json({stockdata:{error:`erorr no stock named ${stock} in database`}})
        } 

         if(!check&&myVal&&like == 'true'){
          
          let myStock = new stockData({
              stock:myVal,
              price:currentPrice,
              likes:viewLike,
              ips:[]
          })
          myStock.ips.push(ip);
          myStock.save((err,info)=>{
            res.status(200).json({
              stock:myVal,
              price:currentPrice,
              likes:viewLike
            })
          })
          
          
        }


        if(check&&like == 'true'){
          let update ={
               $set:{
                price:currentPrice
               },
               $inc:{
               likes:viewLike
               },
               $addToSet:{
                 ips:ip
               }
               }

           stockData.exists({stock:myVal,ips:ip}).then(info =>{
             if(!info){
               stockData.findOneAndUpdate(findMe,update,{new:true}).then(data =>{
             res.status(200).json({
               stock:data.stock,
               price:data.price,
               likes:data.likes
               })
             
           })
             }
             
             if(info){
                let update ={
               $set:{
                price:currentPrice
               }
               }
               stockData.findOneAndUpdate({stock:myVal,ips:ip},update,{new:true}).then(data =>{
                  //console.log(data.ips)  
                  res.status(200).json({
                  stockData:{
                   stock:data.stock,
                   price:data.price,
                   likes:data.likes,
                   ips:"You have already voted for this stock.Please choose another stock and tick like."
                  }
               })
               })
             }
             
           }) 
          
          }
        })
        
       
     }).catch(err => console.log("could not load data due to "+ err))
    }  
    })

};
