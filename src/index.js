const path = require ( 'path' )
const http = require ( 'http' )
const express = require ( 'express' )
const socketio = require ( 'socket.io' )
const Filter = require ( 'bad-words' )
const { generateMessage, generateLocationMessage } = require ( './utils/messages' )
const { addUser, removeUser, getUser, getUsersInRoom } = require ( './utils/users' )

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

    socket.on ( 'join', ( { username, room }, callback ) => {
        const { error, user } = addUser ( {
            id: socket.id,
            username,
            room
        } )
        if ( error ) {
            return callback ( error )
        }
        socket.join ( user.room )
        socket.emit ( 'message', generateMessage ( 'Admin', 'Welcome to the chat room !!' ) )
        socket.broadcast.to ( user.room ).emit ( 'message', generateMessage ( `${user.username} has joined in !!` ) )
        io.to ( user.room ).emit ( 'roomData', {
            room: user.room,
            users: getUsersInRoom ( user.room )  
        } )
        callback ()
    } )

    socket.on ( 'sendMessage', ( message, callback ) => {
        const filter = new Filter ()
        if ( filter.isProfane ( message ) ) {
            return callback ( 'Profanity is not allowed !!')
        }
        const user = getUser ( socket.id )
        io.to ( user.room ).emit ( 'message', generateMessage ( user.username, message ) )
        callback ( 'Message delivered !!' )
    } )

    socket.on ( 'disconnect', () => {
        const user = removeUser ( socket.id )
        if ( user ) {
            io.to ( user.room ).emit ( 'message', generateMessage ( 'Admin', `${user.username} has left !!` ) )
            io.to ( user.room ).emit ( 'roomData', {
                room: user.room,
                users: getUsersInRoom ( user.room )  
            } )
        }
    } )  

    socket.on ( 'shareLocation', ( coords, callback ) => {
        const user = getUser ( socket.id )
        io.to ( user.room ).emit ( 'locationMessage', generateLocationMessage (  user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}` )  )
        callback ( 'Location Shared !!' )
    } )

} )

server.listen ( port, () => {
    console.log ( `Server listening on port ${port}` )
} )