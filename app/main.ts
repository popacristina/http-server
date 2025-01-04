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

    const [requestLine] = reqString.split('\r\n');
    const [method, path, version] = reqString.split(' ');

    if (path === '/') {
      socket.write('HTTP/1.1 200 OK\r\n\r\n');
    } else if (/^\/echo/.test(path)) {
      const [,words] = path.split('/echo/');
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${words.length}\r\n\r\n${words}`);
    } else if (/^\/user-agent/.test(path)) {
      const userAgent = reqString.split('User-Agent: ')[1].split('\r\n')[0];
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`);
    } else {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    }
  });

  socket.on('end', () => {
    console.log('Connection closed');
  });

});

server.listen(4221, "localhost");
