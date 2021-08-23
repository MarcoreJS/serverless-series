const express = require('express')

let app = express()

app.use(express.json())

app.get('/', function(req, res) {
    res.send('Hello world')
})

const PORT = 3000
app.listen(PORT, function() {
    console.log(`App listening on http://localhost:${PORT}`)
})

require('./app/routes/users.routes')(app)
require('./app/routes/tasks.routes')(app)

module.exports = app