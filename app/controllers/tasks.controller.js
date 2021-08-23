const AWS = require('aws-sdk')
const UUID = require('uuid')
var ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' })

exports.createTask = (req, res) => {
	let task_id = UUID.v4()
	let task = {
		pk: task_id,
		sk: 'task',
		task_title: req.body.task_title,
		task_description: req.body.task_description,
		test_data: req.body.test_data
	}
	let params = {
		TableName: 'ServerlessSeries',
		Item: task,
		ReturnConsumedCapacity: 'TOTAL'
	}

	ddb.put(params, (err, data) => {
		if (err) res.status(500).send(err)
		else res.status(200).send({
			CapacityUnits: data.ConsumedCapacity.CapacityUnits,
			task_id: task_id
		})
	})
}

exports.assignTask = (req, res) => {
	let assignment = {
		pk: req.body.user,
		sk: `task#${req.body.task_id}`,
		assignment_status: 'IN_PROGRESS',
		finished_at: null,
		assigned_on: new Date().toISOString(),
		test_data: true
	}
	let params = {
		TransactItems: [
			{
				Update: {
					Key: {
						pk: req.body.task_id,
						sk: 'task'
					},
					ExpressionAttributeValues: {
						':task_status': 'ASSIGNED'
					},
					UpdateExpression: 'SET task_status = :task_status',
					TableName: 'ServerlessSeries'
				},
			},
			{
				Put: {
					Item: assignment,
					ConditionExpression: 'attribute_not_exists(sk)',
					TableName: 'ServerlessSeries'
				}
			}
		],
		ReturnConsumedCapacity: 'TOTAL'
	}

	ddb.transactWrite(params, function(err, data) {
		if (err) res.status(500).send(err) 
		else {
			res.status(200).send({
				CapacityUnits: data.ConsumedCapacity[0].CapacityUnits,
				userAssigned: req.body.user,
				taskAssigned: req.body.task_id
			})
		}
	})
}

exports.getAllTasks = (req, res) => {
	let params = {
		TableName: 'ServerlessSeries',
		ExpressionAttributeValues: {
			':sk': 'task'
		},
		FilterExpression: 'sk = :sk'
	}

	ddb.scan(params, function(err, data) {
		if (err) res.status(500).send(err)
		else res.status(200).send(data.Items)
	})
}

exports.endTask = (req, res) => {
	let params = {
		TransactItems: [
			{
				Update: {
					Key: {
						pk: req.body.task_id,
						sk: 'task'
					},
					ExpressionAttributeValues: {
						':task_status': 'FINISHED'
					},
					UpdateExpression: 'SET task_status = :task_status',
					TableName: 'ServerlessSeries'
				},
			},
			{
				Update: {
					Key: {
						pk: req.body.user_email,
						sk: `task#${req.body.task_id}`
					},
					ExpressionAttributeValues: {
						':assignment_status': 'FINISHED',
						':finished_at': new Date().toISOString()
					},
					UpdateExpression: 'SET assignment_status = :assignment_status, finished_at = :finished_at',
					TableName: 'ServerlessSeries'
				}
			}
		],
		ReturnConsumedCapacity: 'TOTAL'
	}

	ddb.transactWrite(params, function(err, data) {
		if (err) res.status(500).send(err) 
		else	res.status(200).send(data.ConsumedCapacity[0])
	})
}

exports.findByStatus = (req, res) => {
	let params = {
		TableName: 'ServerlessSeries',
		ExpressionAttributeValues: {
			':task_status': req.params.task_status
		},
		FilterExpression: 'task_status = :task_status'
	}
	
	ddb.scan(params, function(err, data) {
		if (err) res.status(500).send(err)
		else res.status(200).send(data.Items)
	})
}
