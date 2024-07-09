import express, { Request, Response } from 'express'
import http from 'http'
import { Server, Socket } from 'socket.io'
import path from 'path'

const app = express()
const server = http.createServer(app)
const io = new Server(server)
const PORT = process.env.PORT || 3000

interface User {
  id: string
  username: string
}

interface Message {
  user: string
  message: string
  timestamp: Date
}

const users: User[] = []
const messages: Message[] = []

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

io.on('connection', (socket: Socket) => {
  console.log('a user connected')

  // Enviar histórico de mensagens para o novo usuário
  socket.emit('chat history', messages)

  socket.on('disconnect', () => {
    console.log('user disconnected')
    const userIndex = users.findIndex((u) => u.id === socket.id)
    if (userIndex !== -1) {
      console.log(`User ${users[userIndex].username} disconnected`)
      users.splice(userIndex, 1)
    }
  })

  socket.on(
    'setUsername',
    (username: string, callback: (response: { success: boolean; message: string }) => void) => {
      console.log('Evento setUsername recebido com username:', username)
      if (!usernameExists(username)) {
        const user: User = {
          id: socket.id,
          username: username,
        }
        users.push(user)
        console.log(`User ${username} conectado`)
        callback({ success: true, message: `Bem-vindo, ${username}!` })
      } else {
        console.log(`Username ${username} já está em uso`)
        callback({
          success: false,
          message: `Nome de usuário ${username} já está em uso. Por favor, escolha outro.`,
        })
      }
    },
  )

  socket.on('chat message', (msg: string) => {
    const user = users.find((u) => u.id === socket.id)
    if (user) {
      const message = {
        user: user.username,
        message: msg,
        timestamp: new Date(),
      }
      messages.push(message)
      console.log(`${user.username}: ${msg}`)
      io.emit('chat message', `${user.username}: ${msg}`)
    }
  })
})

function usernameExists(username: string): boolean {
  const exists = users.some((u) => u.username === username)
  console.log(`UsernameExists para ${username}: ${exists}`)
  return exists
}

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
