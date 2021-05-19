const http = require('http');

http.createServer((request, response) => {
   const { method, url, headers } = request
   if (method === "POST" && url === "/") {
     response.statusCode = 201
     response.setHeader("Content-Type", "application/json")
     const responseBody = {
       headers,
       method,
       url,
       body: {"id": 1}
     }
     response.write(JSON.stringify(responseBody))
     response.end()
   }
 }).listen(8080);

console.log('Server running at http://0.0.0.0:8080/');