const http = require('http');

// Load the Cloudant library.
const Cloudant = require('@cloudant/cloudant');

// Test variables
console.log(process.env);

// Get account details from environment variables
const hostname = process.env.CLOUDANTNOSQLDB_URL || "";
const username = process.env.CLOUDANTNOSQLDB_USERNAME || "";
const password = process.env.CLOUDANTNOSQLDB_APIKEY || "";

http.createServer((request, response) => {
  const { method, url, headers } = request
  if (method === "GET" && url === "/") {

    // Initialize the library with url and credentials.
    const cloudant = Cloudant({ url: hostname, username: username, password: password });

    async function asyncCall() {
      await cloudant.db.create('cats');
      return cloudant.use('cats').get('1');
    }

    asyncCall().then((data) => {
      console.log(data);
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json')
      const responseBody = {
        headers,
        method,
        url,
        body: data
      }
      response.write(JSON.stringify(responseBody.body))
      response.end()
    }).catch((err) => {
      console.log(err);
      response.statusCode = 500
      response.setHeader('Content-Type', 'application/json')
      const responseBody = {
        headers,
        method,
        url,
        body: { 'error': 'Couldn\'t find cat in database' }
      }
      response.write(JSON.stringify(responseBody.body))
      response.end()
    });
  }
}).listen(8080);

console.log('Server running at http://0.0.0.0:8080/');