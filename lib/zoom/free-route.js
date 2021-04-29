const { WebClient } = require('@slack/web-api')
const client = new WebClient(process.env.SLACK_BOT_TOKEN)
const { fetchAllRooms, fetchRoomLoop } = require('../utils/zoom-utils')


const freeRoute = async (reqChannel) => {
    //fetches all zoom rooms then maps the rooms id
    const zoom = await fetchAllRooms();

    const zoomRoomsId = zoom.map(e => e.zoomId);

    //if a room is empty push to isFree
    const isFree = [];

    //loops through each room to see if there is anyone in a zoom room
    for (i = 0; i < zoomRoomsId.length; i++) {
        const room = await fetchRoomLoop(zoomRoomsId)

        if (room.participants.length < 1) {
            let free = {
                name: room.name,
                link: room.joinUrl
            }
            isFree.push(free)
        }
    }

    //base layer for the slack post
    const listRoom = [
        {
            "type": 'section',
            "text": {
                "type": 'mrkdwn',
                "text": '*Here are all the empty Zoom rooms for Alchemy!* :+1:',
            }
        },
        {
            "type": 'divider'
        },

    ];

    //if a room is empty post its name and link
    if (isFree.length > 1) {
        for (i = 0; i < isFree.length; i++) {

            listRoom.push({
                "type": 'section',
                "text": {
                    "type": 'plain_text',
                    "text": isFree[i].name
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "emoji": true,
                        "text": "Join Room"
                    },
                    "url": isFree[i].link,
                    "action_id": "button-action"
                }
            })
        }
    }
    else {
        listRoom.push({
            "type": "section",
            "text": {
                "type": "plain_text",
                "text": 'Sorry, but there are currently no rooms that are empty'
            }
        })
    }

    //post to slack
    await client.chat.postMessage({ channel: reqChannel, 'blocks': listRoom })

}
module.exports = freeRoute
