const mongoose = require('mongoose')
const Schema = mongoose.Schema


const choiceSchema = new Schema({
    index:          Number,
    choice:         String,
})
const questionSchema = new Schema({
    category:       String,
    question:       String,
    choices:        [choiceSchema]  // if there is correct answer, it is at index 0
})  
  
module.exports = mongoose.model('Question', questionSchema)
