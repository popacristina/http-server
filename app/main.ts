import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
// console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  // socket.write('HTTP/1.1 200 OK\r\n\r\n');

  // socket.on('connection', (stream) => {
  //   console.log('somebody connected');
  // })

  socket.on('data', (data) => {
    
    const reqString = data.toString();
    console.log('reqString:', reqString);

    const [requestLine] = reqString.split('\r\n');
    const [method, path, version] = reqString.split(' ');

    console.log('path: ', path);

    if (path === '/') {
      socket.write('HTTP/1.1 200 OK\r\n\r\n');
    } else {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    }
  });

  socket.on('end', () => {
    console.log('Connection closed');
  });

});

server.listen(4221, "localhost");
