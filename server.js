const express = require('express')
const serverless = require('serverless-http')

let app = express()

app.use(express.json())

app.get('/', function(req, res) {
    res.send('Hello world')
})

const PORT = 3000
app.listen(PORT, function() {
    console.log(`App listening on http://localhost:${PORT}`)
})

module.exports.handler = app