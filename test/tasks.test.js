var chai = require("chai");
var chaiHttp = require("chai-http");
var app = require("../server");
var TEST_DATA = require("../test_data/tasks.data.json");
var store = {}

chai.use(chaiHttp)
chai.should()

describe("Tasks", function () {
	describe("Create task POST /tasks/createTask", function () {
		it("T001 Should create a new task", (done) => {
			let task = TEST_DATA["T001"].data
			chai.request(app)
				.post('/tasks/createTask')
				.send(task)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.have.property('task_id')
					res.body.should.have.property('CapacityUnits').eql(1)
					store["T002"] = { task_id: res.body.task_id } 
					store["T003"] = { task_id: res.body.task_id } 
					store["T005"] = { task_id: res.body.task_id } 
					done()
				})
		})
	})
	describe("Assign task POST /tasks/assignTask", function () {
		it("T002 Should assign the task to a user and update the task status", (done) => {
			let task = TEST_DATA["T002"].data
			task.task_id = (task.task_id == "STORED") ? store["T002"].task_id : task.task_id
			chai.request(app)
				.post('/tasks/assignTask')
				.send(task)
				.end((err, res) => {
					res.should.have.status(200)
					// Since we're using DynamoDB transactions here the capacity consumed its doubled in size so 2 records corresponds to 4 units
					res.body.should.have.property("CapacityUnits").eql(4)
					res.body.should.have.property("userAssigned").eql(task.user)
					res.body.should.have.property("taskAssigned").eql(task.task_id)
					done()
				})
		})
		it("T003 Shouldn't assign the task and return an error", (done) => {
			let task = TEST_DATA["T003"].data
			task.task_id = (task.task_id == "STORED") ? store["T003"].task_id : task.task_id
			chai.request(app)
				.post('/tasks/assignTask')
				.send(task)
				.end((err, res) => {
					res.should.have.status(500)
					done()
				})
		})
	})
	describe("Get all tasks GET /tasks", function () {
		it("T004 should list all tasks", (done) => {
			let task = TEST_DATA["T004"].data
			chai.request(app)
				.get('/tasks/all')
				.end((err, res) => {
					res.should.have.status(200)
					chai.expect(res.body).to.be.an('array')
					res.body.forEach(t => {
						t.should.have.property('sk').eql('task')
					})
					done()
				})
		})
	})
	describe("End task POST /tasks/endTask", function () {
		it("T005 Should mark as finished both the assignation and the task", (done) => {
			let task = TEST_DATA["T005"].data
			task.task_id = (task.task_id == "STORED") ? store["T005"].task_id : task.task_id
			chai.request(app)
				.post('/tasks/endTask')
				.send(task)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.have.property("CapacityUnits").eql(4)
					done()
				})
		})
	})
	describe("Get all finished tasks GET /tasks/getByStatus/FINISHED", function () {
		it("T006 should list all tasks with status FINISHED", (done) => {
			let task = TEST_DATA["T006"].data
			chai.request(app)
				.get(`/tasks/getByStatus/${task.status}`)
				.end((err, res) => {
					res.should.have.status(200)
					chai.expect(res.body).to.be.an('array')
					res.body.forEach(t => {
						t.should.have.property('task_status').eql(task.status)
					})
					done()
				})
		})
	})
})
	