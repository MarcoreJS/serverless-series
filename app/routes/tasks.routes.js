module.exports = (app) => {
    const taskController = require('../controllers/tasks.controller')
    var router = require('express').Router()

    router.post('/createTask', taskController.createTask)
    router.post('/assignTask', taskController.assignTask)
    router.post('/endTask', taskController.endTask)
    router.get('/all', taskController.getAllTasks)
    router.get('/getByStatus/:task_status', taskController.findByStatus)

    app.use('/tasks', router)
}