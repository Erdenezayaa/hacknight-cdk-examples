const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;

exports.handler = async (event) => {
  console.log('event: ', event);
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
  let statusCode = 200;
  let body = {
    success: true,
    data: {},
    errors: [],
  };
  try {
    const response = await dynamodb.scan({
      TableName: tableName,
    }).promise();

    body.data = {
      books: response?.Items,
    }
  } catch (error) {
    body.success = false;
    body.errors.push(error.message);
  }

  body = JSON.stringify(body);
  return {
    headers,
    statusCode,
    body,
  }
}