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

  body = JSON.stringify(body);
  return {
    headers,
    statusCode,
    body,
  }
}