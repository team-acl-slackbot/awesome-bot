const { WebClient } = require('@slack/web-api')
const client = new WebClient(process.env.SLACK_BOT_TOKEN)
const { fetchAllRooms, fetchRoomLoop } = require('../utils/zoom-utils')

const userRoute = async (user, chan) => {
    const zoom = await fetchAllRooms();

    const zoomRoomsId = zoom.map(e => e.zoomId);

    const isThere = [];

    const blockOutput = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*Here are all the Zoom rooms that your seach: ${user} is in!* :+1:`,
            }
        },
        {
            "type": "divider"
        },
    ];

    for (i = 0; i < zoomRoomsId.length; i++) {
        const room = await fetchRoomLoop(zoomRoomsId)

        const people = room.participants.map(e => e.name)


        people.forEach((person) => {

            var replace = user;

            var re = new RegExp(replace, "gmi");


            if (re.test(person)) {
                let free = {
                    user: person,
                    name: room.name,
                    link: room.joinUrl
                }
                isThere.push(free);

                blockOutput.push(
                    {
                        'type': 'section',
                        'text': {
                            'type': 'plain_text',
                            'text': free.user,
                        },
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "plain_text",
                            "text": free.name
                        },
                        "accessory": {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "emoji": true,
                                "text": "Go To Room"
                            },
                            "url": free.link,
                            "action_id": "button-action"
                        }
                    })
            }

        }
        )
    }
    if (isThere.length < 1) {
        blockOutput.push({
            "type": "section",
            "text": {
                "type": "plain_text",
                "text": 'sorry but the person is either not in a room or you misspelled their name'
            }
        })
    }

    await client.chat.postMessage({ channel: chan, "blocks": blockOutput })

}

module.exports = userRoute