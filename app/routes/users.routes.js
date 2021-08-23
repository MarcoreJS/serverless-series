module.exports = (app) => {
    const usersController = require('../controllers/users.controller')
    var router = require('express').Router()

    router.post('/createUser', usersController.createUser)
    router.get('/getUserWithAssignments/:email', usersController.getUserWithAssignments)

    app.use('/users', router)
}