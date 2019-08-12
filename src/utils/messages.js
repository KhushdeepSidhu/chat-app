const generateMessage = ( text ) => {
    return {
        text,
        createdAt: new Date ().getTime ()
    }
}

const generateLocationMessage = ( locationURL ) => {
    return {
        url: locationURL,
        createdAt: new Date ().getTime ()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}