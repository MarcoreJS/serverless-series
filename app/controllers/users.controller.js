const AWS = require('aws-sdk')
var ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' })

exports.createUser = (req, res) => {
	let user = {
		pk: req.body.email,
		sk: 'user',
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		test_data: req.body.test_data,
	}
	let params = {
		TableName: 'ServerlessSeries',
		Item: user,
		ConditionExpression: 'attribute_not_exists(pk)',
		ReturnConsumedCapacity: 'TOTAL'
	}

	ddb.put(params, function (err, data) {
		if (err) res.status(500).send(err)
		else res.status(200).send(data.ConsumedCapacity)
	})
}

exports.getUserWithAssignments = (req, res) => {
	let params = {
		TableName: 'ServerlessSeries',
		ExpressionAttributeNames: {
			'#pk': 'pk'
		},
		ExpressionAttributeValues: {
			':pk': req.params.email
		},
		KeyConditionExpression: '#pk = :pk'
	}

	ddb.query(params, function (err, data) {
		if (err) res.status(500).send(err)
		else {
			let result = {
				user: {},
				assignments: []
			}
			data.Items.forEach(i => {
				if (i.sk == 'user') result.user = i
				else result.assignments.push(i)
			})
			res.status(200).send(result)
		}
	})
}