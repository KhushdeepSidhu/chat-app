const socket = io ()

// Elements
const $messageForm = document.querySelector ( '#message-form' )
const $messageFormInput = document.querySelector ( 'input' )
const $messageFormButton = document.querySelector ( 'button' )
const $shareLocationButton = document.querySelector ( '#share-location' )
const $messages = document.querySelector ( '#messages' )

// Templates
const messageTemplate = document.querySelector ( '#message-template' ).innerHTML
const locationMessageTemplate = document.querySelector ( '#location-message-template' ).innerHTML

// Listen for "message" event
socket.on ( 'message', ( message ) => {
    const html = Mustache.render ( messageTemplate, {
        message
    } )
    $messages.insertAdjacentHTML ( 'beforeend', html )
    console.log ( message )
} )

// Listen for location sharing message event
socket.on ( 'locationMessage', ( locationURL ) => {
    const html = Mustache.render ( locationMessageTemplate, {
        locationURL
    } )
    $messages.insertAdjacentHTML ( 'beforeend', html )
    console.log ( locationURL )
} )

$messageForm.addEventListener ( 'submit', ( event ) => {
    event.preventDefault ()

    $messageFormButton.setAttribute ( 'disabled', 'disabled' )

    const message = event.target.elements.message.value

    socket.emit ( 'sendMessage', message, ( message ) => {
        $messageFormButton.removeAttribute ( 'disabled' )
        $messageFormInput.value = ''
        $messageFormInput.focus ()
        console.log ( message )
    } )
} )

$shareLocationButton.addEventListener ( 'click', () => {

    if ( !navigator.geolocation ) {
        return alert ( 'Geolocation is not supported by your browser' )
    }

    $shareLocationButton.setAttribute ( 'disabled', 'disabled' )

    navigator.geolocation.getCurrentPosition ( ( position ) => {
        socket.emit ( 'shareLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ( message ) => {
            $shareLocationButton.removeAttribute ( 'disabled' )
            console.log ( message )
        } )
    } )

} )