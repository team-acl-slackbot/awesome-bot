const { Router } = require('express');
const fetch = require('node-fetch');
const { WebClient } = require('@slack/web-api');

const verifyToken = require('../middleware/verify-token');
const client = new WebClient(process.env.SLACK_BOT_TOKEN);

module.exports = Router()
    .post('/',verifyToken, async(req, res, next)=>{
        
        //grab futurama character from slack payload
        const character = req.body.text

        try {
            const response = await fetch(`http://futuramaapi.herokuapp.com/api/characters/${character}/1`)

            const quote = await response.json()

            await client.chat.postMessage({
                channel:req.body.channel_id,
                blocks: [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": `${quote[0].character}`,
                            "emoji": true
                        }
                    },
                    {
                        "type": "image",
                        "image_url": `${quote[0].image}`,
                        "alt_text": "marg"
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `*"${quote[0].quote}"*`
                        }
                    }
                    ]
            })
                
            res.send()
        } catch (error) {
            next(error)
        }
    })
