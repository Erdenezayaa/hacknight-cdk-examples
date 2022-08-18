const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;
const crypto = require('crypto');

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
    const body = JSON.parse(event.body);

    const response = await dynamodb.put({
      TableName: tableName,
      Item: {
        bookId: crypto.randomUUID(),
        bookName: body.name,
      }
    }).promise();

    body.data = {
      response: 'Book added Yeah!!!!!!!'
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