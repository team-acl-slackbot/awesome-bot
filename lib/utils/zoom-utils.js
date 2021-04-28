const fetch = require('node-fetch');
const { WebClient } = require("@slack/web-api")
const client = new WebClient(process.env.SLACK_BOT_TOKEN)

//fetches all the rooms from the API
const fetchRooms = (parsed) => {
    return fetch(
        `https://alchemeetings.alchemycodelab.io/api/v1/meetings/${parsed.actions[0].value}`,
        {
            headers: {
                'X-API-KEY': process.env.ZOOM_API_KEY,
            },
        }
    )
}

//checks if the room has any participants
const participantsChecker = (Participants) => {
    const partiCheck = Participants.toString();

    if (!partiCheck) return 'None';
    return `\n - ` + Participants.join(`, \n - `);
}

// returns a reponse
const clientModal = (Room, Link, participants, parsed) => {
    return client.views.open({
        trigger_id: parsed.trigger_id,
        view: {
            "type": "modal",
            "title": {
                "type": "plain_text",
                "text": "Alchemy Zoom Room Info"
            },
            "close": {
                "type": "plain_text",
                "text": "Close"
            },
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `<${Link}|${Room} (Click Here)>`
                    }
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": `Participants: ${participantsChecker(participants)}`
                        }
                    ]
                }
            ]
        }
    });
}

const fetchAllRooms = async () => {
    const zoom = await fetch('https://alchemeetings.alchemycodelab.io/api/v1/meetings', {
        method: 'GET',
        headers: { 'x-api-key': process.env.ZOOM_API_KEY }
    })
        .then((res) => res.json())
        .then(data => { return data })

    return zoom
}

const fetchRoomLoop = async (roomName) => {
    const room = await fetch(`https://alchemeetings.alchemycodelab.io/api/v1/meetings/${roomName[i]}`, {
        method: 'GET',
        headers: { 'x-api-key': process.env.ZOOM_API_KEY }
    })
        .then((res) => res.json())
        .then(data => { return data })

    return room
}
module.exports = {
    fetchRooms,
    clientModal,
    fetchAllRooms,
    fetchRoomLoop
}