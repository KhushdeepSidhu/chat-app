const socket = io ()

// Elements
const $messageForm = document.querySelector ( '#message-form' )
const $messageFormInput = document.querySelector ( 'input' )
const $messageFormButton = document.querySelector ( 'button' )
const $shareLocationButton = document.querySelector ( '#share-location' )
const $messages = document.querySelector ( '#messages' )
const $sidebar = document.querySelector ( '#sidebar' )

// Templates
const messageTemplate = document.querySelector ( '#message-template' ).innerHTML
const locationMessageTemplate = document.querySelector ( '#location-message-template' ).innerHTML
const sidebarTemplate = document.querySelector ( '#sidebar-template' ).innerHTML

// Options
const { username, room } = Qs.parse ( location.search, { ignoreQueryPrefix: true } )

// Auto scrolling
const autoScroll = () => {

    // New message
    const $newMessage = $messages.lastElementChild

    // Height of the new message 
    const newMessageStyles = getComputedStyle ( $newMessage )    // to figure out the margin bottom spacing value
    const newMessageMargin = parseInt ( newMessageStyles.marginBottom )
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible Height 
    const visibleHeight = $messages.offsetHeight

    // Height of messages container 
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled ?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if ( containerHeight - newMessageHeight <= scrollOffset ) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Listen for "message" event
socket.on ( 'message', ( message ) => {
    const html = Mustache.render ( messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment ( message.createdAt ).format ( 'h:mm a' )
    } )
    $messages.insertAdjacentHTML ( 'beforeend', html )
    autoScroll ()
} )

// Listen for location sharing message event
socket.on ( 'locationMessage', ( locationMessage ) => {
    const html = Mustache.render ( locationMessageTemplate, {
        username: locationMessage.username,
        locationURL: locationMessage.url,
        createdAt: moment ( locationMessage.createdAt ).format ( 'h:mm a' )
    } )
    $messages.insertAdjacentHTML ( 'beforeend', html )
    autoScroll ()
} )

// Listen for roomData event to render user list
socket.on ( 'roomData', ( { room, users } ) => {
    const html = Mustache.render ( sidebarTemplate, {
        room,
        users
    } )
    $sidebar.innerHTML = html
} )

$messageForm.addEventListener ( 'submit', ( event ) => {
    event.preventDefault ()

    $messageFormButton.setAttribute ( 'disabled', 'disabled' )

    const message = event.target.elements.message.value

    socket.emit ( 'sendMessage', message, ( message ) => {
        $messageFormButton.removeAttribute ( 'disabled' )
        $messageFormInput.value = ''
        $messageFormInput.focus ()
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
        } )
    } )

} )

// Join event
socket.emit ( 'join', { username, room }, ( error ) => {
    if ( error ) {
        alert ( error )
        location.href = '/'
    }    
} )