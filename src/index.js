const path = require ( 'path' )
const http = require ( 'http' )
const express = require ( 'express' )
const socketio = require ( 'socket.io' )
const Filter = require ( 'bad-words' )

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

// Listen for new connections to Socket.io
io.on ( 'connection', ( socket ) => {

    console.log ( 'New WebSocket connection' )

    socket.emit ( 'message', 'Welcome to the chat room !!' )
    socket.broadcast.emit ( 'message', 'A new user has joined in !!' )

    socket.on ( 'sendMessage', ( message, callback ) => {
        const filter = new Filter ()
        if ( filter.isProfane ( message ) ) {
            return callback ( 'Profanity is not allowed !!')
        }
        io.emit ( 'message', message )
        callback ( 'Message delivered !!' )
    } )

    socket.on ( 'disconnect', () => {
        io.emit ( 'message', 'A user has left !!' )
    } )  

    socket.on ( 'shareLocation', ( coords, callback ) => {
        io.emit ( 'locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}` )
        callback ( 'Location Shared !!' )
    } )

} )

server.listen ( port, () => {
    console.log ( `Server listening on port ${port}` )
} )