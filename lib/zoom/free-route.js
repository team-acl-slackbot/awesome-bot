const { WebClient } = require('@slack/web-api')
const client = new WebClient(process.env.SLACK_BOT_TOKEN)
const { fetchAllRooms, fetchRoomLoop } = require('../utils/zoom-utils')


const freeRoute = async (abc) => {

    const zoom = await fetchAllRooms();

    const zoomRoomsId = zoom.map(e => e.zoomId);

    const isFree = [];

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
                "text": 'Sorry, but there are currently no room that are empty'
            }
        })
    }

    await client.chat.postMessage({ channel: abc, 'blocks': listRoom })

}
module.exports = freeRoute