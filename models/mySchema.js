const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockSchema = ({
   stock:{
     type:String,
     required:true
   },
   price:{
     type:Number,
     reuired:true
   },
   likes:{
     type:Number,
     default:0
   },
   ips:[String],
   /*rel_likes:{
     type:Number,
     required:true
   }*/
})

const mySchema = mongoose.model('stockData',stockSchema);
module.exports = mySchema;