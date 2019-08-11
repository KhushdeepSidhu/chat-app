const path = require ( 'path' )
const http = require ( 'http' )
const express = require ( 'express' )
const socketio = require ( 'socket.io' )

const app = express ()

// configure port to make the application on heroku also
const port = process.env.PORT || 3000

// Create the HTTP server using the Express app
const server = http.createServer( app )

// Connect socket.io to the http server
const io = socketio( server )

// Define paths
const publicDirPath = path.join ( __dirname, '../public' )

// Setup static directory to serve
app.use ( express.static ( publicDirPath ) )

// let count = 0

// Listen for new connections to Socket.io
io.on ( 'connection', ( socket ) => {
    
    console.log ( 'New WebSocket connection' )

    socket.emit ( 'message', 'Welcome to the chat room !!' )

    socket.on ( 'sendMessage', ( message ) => {
        io.emit ( 'message', message )
    } )

} )

server.listen ( port, () => {
    console.log ( `Server listening on port ${port}` )
} )