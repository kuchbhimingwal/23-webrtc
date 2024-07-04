import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data: any) {
    const message = JSON.parse(data);
    if(message.type === "identify-as-sender"){
      senderSocket = ws;
    } else if (message.type === "identify-as-receiver"){
      receiverSocket = ws;
    } else if (message.type === "create-offer"){
      receiverSocket?.send(JSON.stringify({type: "offer", offer: message.offer}))
    } else if (message.type === "create-answere") {
      senderSocket?.send(JSON.stringify({type: "answere", offer: message.offer}))
    } else if (message.type === 'iceCandidate') {
      if (ws === senderSocket) {
        receiverSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
      } else if (ws === receiverSocket) {
        senderSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
      }
    }

    console.log(message);
  });

  ws.send('something');
});