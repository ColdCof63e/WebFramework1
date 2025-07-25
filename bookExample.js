const express = require('express')
const mongoose = require('mongoose')
const path = require('path')


const app = express()
app.use(express.urlencoded({extended: true}))
app.use(express.static('views'))

const port = 3000

var mongoDB = 'mongodb+srv://n01690273:InCanada2024_atlasDB@cluster0.jnjy7j9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/testingAtlas';

mongoose.connect(mongoDB)

const bookSchema = new mongoose.Schema({
    bookName: String,
    content: String,
    author: String
})

const Book = mongoose.model("Book", bookSchema)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/book.html'))
})

app.post('/bookSubmitted', (req, res) => {
    var item = {
        bookName: req.body.bookName,
        content: req.body.content,
        author: req.body.author
    }
    res.send(`<h2>You have submitted the book: ${req.body.bookName}</h2>`)

    new Book(item).save()
})

app.listen(port, () => {
    console.log(`Listening at Port: ${port}`)
})