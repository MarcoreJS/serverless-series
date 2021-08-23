const AWS = require('aws-sdk')
var ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' })

console.log("Starting clean up routine")

let done = 0
let params = {
	TableName: 'ServerlessSeries',
	ExpressionAttributeValues: {
		':test_data': true
	},
	FilterExpression: 'test_data = :test_data'
}

ddb.scan(params, function (err, data) {
	if (err) console.log("Error cleaning up")
	else {
		let items = data.Items
		data.Items.forEach(i => {
			let p = {
				TableName: "ServerlessSeries",
				Key: {
					pk: i.pk,
					sk: i.sk,
				},
			};
			ddb.delete(p, function (err, data) {
				if (err) console.log(err);
				else {
					done++;
					if (done == items.length) {
						console.log("Successfully cleaned test data");
					}
				}
			});
		})
	}
})