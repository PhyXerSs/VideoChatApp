const express = require('express')
const http = require('http')
const app = express()
const server =  http.createServer(app)
const io = require('socket.io')(server,{
    cors:{
        origin:"http://localhost:3000",
        methods: ["GET","POST"]
    }
})


io.on('connection',(socket)=>{
    console.log('a user connected')
    socket.emit('connected',socket.id)

    socket.on('disconnect',()=>{
        console.log('a user disconnected')
        socket.broadcast.emit('callEnd')
    })

    socket.on('callUser', (data)=>{
        io.to(data.userToCall).emit('callUser', {signal:data.signalData , from:data.from , name: data.name })
    })

    socket.on('answerCall' , (data)=>{
        io.to(data.to).emit('callAccepted',{signal:data.signal,name:data.name})
    })

    socket.on('sendMessage',(data)=>{
        console.log('message:',data.message);
        io.to(data.to).emit('reciveMessage',data.message)
    })
})


server.listen(4000, ()=>{
    console.log('Start server at port 4000.')
})