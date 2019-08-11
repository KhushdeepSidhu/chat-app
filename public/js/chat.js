const socket = io ()

// Listen for "message" event
socket.on ( 'message', ( message ) => {
    console.log ( message )
} )

document.querySelector ( '#message-form' ).addEventListener ( 'submit', ( event ) => {
    event.preventDefault ()
    const message = event.target.elements.message

    socket.emit ( 'sendMessage', message )
} )

document.querySelector ( '#share-location' ).addEventListener ( 'click', () => {

    if ( !navigator.geolocation ) {
        return alert ( 'Geolocation is not supported by your browser' )
    }

    navigator.geolocation.getCurrentPosition ( ( position ) => {
        socket.emit ( 'shareLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        } )
    } )

} )