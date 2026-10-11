const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// ذخیره پیام‌ها در حافظه موقت سرور
let messages = [];

io.on('connection', (socket) => {
    console.log('کاربر متصل شد:', socket.id);

    // ارسال تاریخچه پیام‌ها به کاربر جدید
    socket.emit('init_data', { messages });

    // دریافت پیام جدید
    socket.on('send_message', (data) => {
        const msgObj = {
            id: Date.now().toString(),
            name: data.name,
            isOwner: data.isOwner,
            text: data.text || '',
            type: data.type || 'text', // text, image, voice
            mediaUrl: data.mediaUrl || '',
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
        };

        messages.push(msgObj);
        // محدود کردن پیام‌های ذخیره شده در حافظه به ۱۰۰ پیام آخر
        if (messages.length > 100) messages.shift();

        io.emit('new_message', msgObj);
    });

    socket.on('disconnect', () => {
        console.log('کاربر قطع شد:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`سرور روی پورت ${PORT} اجرا شد`);
});
