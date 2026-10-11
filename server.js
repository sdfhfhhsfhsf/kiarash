const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 10 * 1024 * 1024 // اجازه آپلود عکس‌های کوچک آواتار
});

app.use(express.static(path.join(__dirname, 'public')));

let messages = [];

io.on('connection', (socket) => {
    socket.emit('init_data', { messages });

    socket.on('send_message', (data) => {
        const msgObj = {
            id: Date.now().toString(),
            name: data.name,
            isOwner: data.isOwner,
            ownerBadgeImg: data.ownerBadgeImg || '',
            text: data.text || '',
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
        };

        messages.push(msgObj);
        if (messages.length > 100) messages.shift();

        io.emit('new_message', msgObj);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
