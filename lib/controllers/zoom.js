const { Router } = require('express');
const { WebClient } = require('@slack/web-api')
const client = new WebClient(process.env.SLACK_BOT_TOKEN)
const fetch = require('node-fetch')
const verifyToken = require('../middleware/verify-token')

const { fetchAllRooms } = require('../utils/zoom-utils')

module.exports= Router()

.post('/free', verifyToken, async (req, res, next) => { 
    res.send();
    
    if (req.body.text.toLowerCase() === 'free') {
        try {
            const zoom = await fetchAllRooms()

            const room_names = zoom.map(e => e.zoomId)

            const isFree = []

            for (i = 0; i < room_names.length; i++) {
                const room = await fetch(`https://alchemeetings.alchemycodelab.io/api/v1/meetings/${room_names[i]}`, {
                    method: 'GET',
                    headers: { 'x-api-key': process.env.ZOOM_KEY}
                })
                .then((res) => res.json())
                .then(data => { return data })

                if(room.participants.length < 1) {
                    let free = {
                        name: room.name,
                        link: room.joinUrl
                    }
                    isFree.push(free)
                }
            }

            const listRoom = [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "Free Rooms",
                        "emoji": true
                    }
                },
                {
                    "type": "divider"
                },
                
            ]

            if (isFree.length > 1) {
                for (i = 0; i < isFree.length; i++) {

                   listRoom.push({
                        "type": "section",
                        "text": {
                            "type": "plain_text",
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
                listRoom.push({"type": "section",
                    "text": {
                        "type": "plain_text",
                        "text": 'Sorry, but there are currently no room that are empty'
                    }
                })
            }
            await client.chat.postMessage({ channel: req.body.channel_id, 'blocks': listRoom })
                
               
        }
        
        catch (error) {
            next(error)
        }
    }
})