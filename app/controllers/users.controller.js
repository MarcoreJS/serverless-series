const AWS = require('aws-sdk')
var ddb = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" })

exports.createUser = (req, res) => {
    var params = {
        TableName: ""
    }
}