const { WebClient } = require('@slack/web-api')
const client = new WebClient(process.env.SLACK_BOT_TOKEN)
const { fetchAllRooms, fetchRoomLoop } = require('../utils/zoom-utils')

const findUserRoute = async (user, reqChannel) => {
    //feteches all zoom rooms then maps the rooms id
    const zoom = await fetchAllRooms();

    const zoomRoomsId = zoom.map(e => e.zoomId);

    //empty array to check if user input matches any users in participants
    const isThere = [];

    //base 
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

    //loops through the zoom room ids and finds all the participants in each room
    for (i = 0; i < zoomRoomsId.length; i++) {
        const room = await fetchRoomLoop(zoomRoomsId)

        const people = room.participants.map(e => e.name)

        //searches for what user input within the participants 
        people.forEach((person) => {

            var replace = user;

            var re = new RegExp(replace, "gmi");

            //if user input is found push the name of the user, room they are in and link
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
    //if user input is not found then push this response to blockOutput
    if (isThere.length < 1) {
        blockOutput.push({
            "type": "section",
            "text": {
                "type": "plain_text",
                "text": 'sorry but the person is either not in a room or you misspelled their name'
            }
        })
    }

    //post message onto slack
    await client.chat.postMessage({ channel: reqChannel, "blocks": blockOutput })

}

module.exports = findUserRoute