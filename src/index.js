const path = require ( 'path' )
const express = require ( 'express' )

const app = express ()

// configure port to make the application on heroku also
const port = process.env.PORT || 3000

// Define paths
const publicDirPath = path.join ( __dirname, '../public' )

// Setup static directory to serve
app.use ( express.static ( publicDirPath ) )

app.listen ( port, () => {
    console.log ( `Server listening on port ${port}` )
} )