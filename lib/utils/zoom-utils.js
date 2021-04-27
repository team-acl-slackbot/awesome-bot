const fetch = require('node-fetch')

const fetchAllRooms = async () => {
   const zoom = await fetch('https://alchemeetings.alchemycodelab.io/api/v1/meetings', {
                method: 'GET',
                headers: { 'x-api-key': process.env.ZOOM_KEY}
            })
            .then((res) => res.json())
            .then(data => { return data })

    return zoom
}

const fetchRoomLoop = async (roomName) => {
    const room = await fetch(`https://alchemeetings.alchemycodelab.io/api/v1/meetings/${room_names[i]}`, {
                    method: 'GET',
                    headers: { 'x-api-key': process.env.ZOOM_KEY}
                })
                .then((res) => res.json())
                .then(data => { return data })

    return room
}

module.exports = {
    fetchAllRooms,
    fetchRoomLoop
}