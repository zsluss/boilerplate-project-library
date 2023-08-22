/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
require('dotenv').config()
let mongoose = require("mongoose")
const Schema = mongoose.Schema

//connect to MongooDB
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', () => {
  console.log("Connection established!")
})
let booksSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: {type: [String], default: []}
});

const Books = mongoose.model('Books', booksSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      let list = {
        _id:1,
        title:1,
        commentcount: {$size: '$comments'}
      }
      const allBooks = Books.aggregate([{$match: {}}, {$project: list}]) 
            .then(data=>{
        res.json(data)
      })
      .catch(res.err)
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      let title = req.body.title;
      if(title === undefined){ return res.send('missing required field title')}
      let book = Books({
        title: title
      })
      book.save()
      .then((data)=> {
        return res.json({
          title: data.title,
          _id: data._id
        })
      })
       //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
       Books.deleteMany({})
      .then(
        (data)=>{
           res.send('complete delete successful')}
          )
           //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      if (bookid === undefined || bookid === ""){return res.json('no book exists')}
    Books.findById(bookid)
      .then((data)=>{
        if (data){
      res.json({
        _id: data._id,
        title: data.title,
        comments: data.comments,
      })}
      else{
      return res.json('no book exists')}
    })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      if(bookid===undefined){return res.send('no book exists')}
      if(comment===undefined){return res.send('missing required field comment')}
     await Books.findByIdAndUpdate(bookid,{ $push: { comments: comment } });
     Books.findById(bookid)
       .then((data)=>{
        if(data){
        res.json({
          _id: data._id,
          title: data.title,
          comments: data.comments,
        })}
        else{res.send('no book exists')}
    })

      //json res format same as .get
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      if(bookid===undefined){return res.send('no book exists')}
      //if successful response will be 'delete successful'
      Books.findByIdAndDelete({_id: bookid})
      .then((data)=> {
        if(data){
        res.send('delete successful')}
        else{res.send('no book exists')}
      })
    });
  
};
