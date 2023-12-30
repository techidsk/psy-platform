// pages/api/websocket/[id].js

const WebSocket = require('ws');

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const wss = new WebSocket.Server({ noServer: true });
        const { id } = req.query
        console.log('websocket: ' + id)
        // Handle WebSocket connection
        wss.on('connection', (ws) => {
            console.log('WebSocket connected');

            // Handle incoming message
            ws.on('message', (message) => {
                console.log(`Received message: ${message}`);

                // Broadcast message to all connected clients
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });
            });

            // Handle WebSocket disconnection
            ws.on('close', () => {
                console.log('WebSocket disconnected');
            });
        });

        // Upgrade HTTP request to WebSocket
        res.setHeader('Upgrade', 'websocket');
        res.setHeader('Connection', 'Upgrade');
        res.setHeader('Sec-WebSocket-Accept', '');
        res.writeHead(101);
        res.end();

    } else {
        res.status(405).send({ message: 'Method not allowed' });
    }
}
