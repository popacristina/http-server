import { file } from "bun";
import * as net from "net";
import fs from 'node:fs';
import process from "node:process";


const server = net.createServer((socket) => {
  console.log('New connection established...');

  socket.on('data', (data) => {
    try {
      handleRequest(data.toString(), socket);
    } catch (error) {
      console.log("Error handling request: ", error);
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
    }
  });
    
  socket.on('end', () => {
    console.log('Connection closed!');
  });

  socket.on('error', (err) => {
    console.log('Socket error:', err);
  })

});

function handleRequest (request: string, socket: net.Socket) {
  const [requestLine, ...headers] = request.split("\r\n");
  const [method, path, version] = requestLine.split(" ");
  
  if (path === '/') {
    sendResponse(socket, 200, "OK", "text/plain", "");
    return;
  }

  const indexPath = path.split("/").filter(Boolean);
  const [indexRoute, ...parameters] = indexPath;
  console.log('index route: ', indexRoute);

  if(!method || !version) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    return;
  }

  switch (indexRoute) {
    case 'echo':
      const body = decodeURIComponent(path.replace("/echo/", ""));
      sendResponse(socket, 200, "OK", "text/plain", body);
      break;
    case 'user-agent':
      const userAgent = getHeaderValue(headers, "User-Agent");
      userAgent ? 
      sendResponse(socket, 200, "OK", "text/plain", userAgent)
      : sendResponse(socket, 400, "Bad Request", "text/plain", "User-Agent not found");
      break;
    case 'files':
      const filePath = process.argv[3] + parameters[0];
      if (method === 'POST') {
        let content = headers[headers.length - 1];
        writeFile(filePath, content, socket);
      } else {
        readFile(filePath, socket);
      }
      break;
    default:
      sendResponse(socket, 404, "Not Found", "text/plain", "");
      break;

  }
}

server.listen(4221, "localhost");

function sendResponse(
  socket: net.Socket,
  statusCode: number,
  statusMessage: string,
  contentType: string,
  body: string
) {
  const headers = [
    `HTTP/1.1 ${statusCode} ${statusMessage}`,
    `Content-Type: ${contentType}`,
    `Content-Length: ${Buffer.byteLength(body)}`,
    "",
    body,
  ];

  socket.write(headers.join("\r\n"));
}

function readFile(filePath: string, socket: net.Socket) {
  try {
    const fileData = fs.readFileSync(`${filePath}`, 'utf-8');
    sendResponse(socket, 200, "OK", "application/octet-stream", fileData);
  } catch (err) {
    sendResponse(socket, 404, "Not Found", "text/plain", "");
  }
}

function writeFile(filePath: string, fileContent: string, socket: net.Socket) {
  try {
    fs.writeFileSync(filePath, fileContent);
    sendResponse(socket, 201, "Created", "text/plain", "");
  } catch (err) {
    console.log('Error writing file: ', err);
    socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
  }
}

      
function getHeaderValue(headers: string[], headerName: string): string | null {
  const header = headers.find((h) => h.toLowerCase().startsWith(headerName.toLowerCase() + ":"));
  return header ? header.split(":")[1].trim() : null;
}
