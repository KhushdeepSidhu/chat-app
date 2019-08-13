const path = require ( 'path' )
const http = require ( 'http' )
const express = require ( 'express' )
const socketio = require ( 'socket.io' )
const Filter = require ( 'bad-words' )
const { generateMessage, generateLocationMessage } = require ( './utils/messages' )

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

    socket.on ( 'join', ( { username, room } ) => {
        socket.join ( room )
        socket.emit ( 'message', generateMessage ( 'Welcome to the chat room !!' ) )
        socket.broadcast.to ( room ).emit ( 'message', generateMessage ( `${username} has joined in !!` ) )
    } )

    socket.on ( 'sendMessage', ( message, callback ) => {
        const filter = new Filter ()
        if ( filter.isProfane ( message ) ) {
            return callback ( 'Profanity is not allowed !!')
        }
        io.to ( 'Vaudreuil-Dorion' ).emit ( 'message', generateMessage ( message ) )
        callback ( 'Message delivered !!' )
    } )

    socket.on ( 'disconnect', () => {
        io.emit ( 'message', generateMessage ( 'A user has left !!' ) )
    } )  

    socket.on ( 'shareLocation', ( coords, callback ) => {
        io.emit ( 'locationMessage', generateLocationMessage (  `https://google.com/maps?q=${coords.latitude},${coords.longitude}` )  )
        callback ( 'Location Shared !!' )
    } )

} )

server.listen ( port, () => {
    console.log ( `Server listening on port ${port}` )
} )