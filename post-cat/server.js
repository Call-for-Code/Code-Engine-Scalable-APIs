const http = require('http');

// Load the Cloudant library.
const Cloudant = require('@cloudant/cloudant');

// Get account details from environment variables
const url = process.env.cloudant_url;
const username = process.env.cloudant_username;
const password = process.env.cloudant_password;

// Initialize the library with url and credentials.
const cloudant = Cloudant({ url: url, username: username, password: password });

http.createServer((request, response) => {
  const { method, url, headers } = request
  if (method === 'POST' && url === '/') {
    async function asyncCall() {
      await cloudant.db.create('cats');
      return cloudant.use('cats').insert({ 'name': 'Tahoma', 'color': 'Tabby' }, '1');
    }

    asyncCall().then((data) => {
      console.log(data);
      response.statusCode = 201
      response.setHeader('Content-Type', 'application/json')
      const responseBody = {
        headers,
        method,
        url,
        body: { 'id': 1 }
      }
    }).catch((err) => {
      console.log(err);
      response.statusCode = 500
      response.setHeader('Content-Type', 'application/json')
      const responseBody = {
        headers,
        method,
        url,
        body: { 'error': 'Couldn\'t save to database' }
      }
    });

    response.write(JSON.stringify(responseBody))
    response.end()
  }
}).listen(8080);

console.log('Server running at http://0.0.0.0:8080/');