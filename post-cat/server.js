const http = require('http');

// Load the Cloudant library.
const Cloudant = require('@cloudant/cloudant');

// Test variables
console.log(process.env);

// Get account details from environment variables
const catsdb = process.env.CLOUDANTNOSQLDB_URL || "";
const apikey = process.env.CLOUDANTNOSQLDB_APIKEY || "";

http.createServer((request, response) => {
  const { method, url, headers } = request
  if (method === 'POST' && url === '/') {

    // Initialize the library with url and credentials.
    const cloudant = Cloudant({ url: catsdb, plugins: { iamauth: { iamApiKey: apikey } } });

    async function asyncCall() {
      try {
        await cloudant.db.create('cats');
      } catch(err) {
        // No op
      }
      return cloudant.use('cats').insert({ _id: 1, name: 'Tahoma', color: 'Tabby' });
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
        body: { 'error': 'Couldn\'t save cat to database' }
      }
      response.write(JSON.stringify(responseBody.body))
      response.end()
    });
  }
}).listen(8080);

console.log('Server running at http://0.0.0.0:8080/');