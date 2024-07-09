"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const PORT = process.env.PORT || 3000;
const users = [];
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'index.html'));
});
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
        const userIndex = users.findIndex((u) => u.id === socket.id);
        if (userIndex !== -1) {
            console.log(`User ${users[userIndex].username} disconnected`);
            users.splice(userIndex, 1);
        }
    });
    socket.on('setUsername', (username, callback) => {
        console.log('Evento setUsername recebido com username:', username);
        if (!usernameExists(username)) {
            const user = {
                id: socket.id,
                username: username,
            };
            users.push(user);
            console.log(`User ${username} conectado`);
            callback({ success: true, message: `Bem-vindo, ${username}!` });
        }
        else {
            console.log(`Username ${username} já está em uso`);
            callback({
                success: false,
                message: `Nome de usuário ${username} já está em uso. Por favor, escolha outro.`,
            });
        }
    });
    socket.on('chat message', (msg) => {
        const user = users.find((u) => u.id === socket.id);
        if (user) {
            console.log(`${user.username}: ${msg}`);
            io.emit('chat message', `${user.username}: ${msg}`);
        }
    });
});
function usernameExists(username) {
    const exists = users.some((u) => u.username === username);
    console.log(`UsernameExists para ${username}: ${exists}`);
    return exists;
}
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
