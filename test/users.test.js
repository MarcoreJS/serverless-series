var chai = require("chai");
var chaiHttp = require("chai-http");
var app = require("../server");
var TEST_DATA = require("../test_data/users.data.json");

chai.use(chaiHttp)
chai.should()

describe("Users", function () {
	describe("Create user POST /users/createUser", function () {
		it("U001 Should create a new user", (done) => {
			let user = TEST_DATA["U001"].data
			chai.request(app)
				.post('/users/createUser')
				.send(user)
				.end((err, res) => {
					res.should.have.status(200)
					// DynamoDB returns how many capacity units we use, since we only write 1 record in this transaction it should be 1
					res.body.should.have.property('CapacityUnits').eql(1) 
					done()
				})
		})
		it("U002 Shouldn't create a new user with repeated email and return an error", (done) => {
			let user = TEST_DATA["U002"].data
			chai.request(app)
				.post('/users/createUser')
				.send(user)
				.end((err, res) => {
					res.should.have.status(500)
					done()
				})
		})
		it("U003 Shouldn't create a new user without email and return an error", (done) => {
			let user = TEST_DATA["U003"].data
			chai.request(app)
				.post('/users/createUser')
				.send(user)
				.end((err, res) => {
					res.should.have.status(500)
					done()
				})
		})
	})
	describe("Get user GET /users/:user_email", function() {
		it("U004 Should list all the assignments of a user", (done) => {
			let user = TEST_DATA["U004"].data
			chai.request(app)
				.get(`/users/getUserWithAssignments/${user.user}`)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.have.property('user').to.be.an('object')
					res.body.should.have.property('assignments').to.be.an('array')
					done()
				})
		})
	})
})