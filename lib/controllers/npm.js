const { Router } = require('express')
const qs = require('qs')
const { WebClient } = require("@slack/web-api")
const client = new WebClient(process.env.SLACK_BOT_TOKEN)
const { npmScraper } = require('../utils/npm-utils')
const verifyToken = require('../middleware/verify-token')

module.exports = Router()
    .post('/', verifyToken, async (req, res, next) => {
        
        // ack request
        res.send()
        
        /*
        Convert text string to url query format for fetch, then fetch results.
        */
        const rawTextInput = req.body.text
        const parsedQuery = qs.stringify({q: rawTextInput}, { format:'RFC1738' })
        

        const scrapedData = await npmScraper(parsedQuery)
 

        const formattedBlocks = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `+++++ \n Top 3 search results for *${req.body.text}* @ npmjs: \n +++++`
                }
            },
            {
                "type": "divider"
            },
        ]

        scrapedData.slice(0, 3).forEach(ele => {
            formattedBlocks.push(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*${ele.pkg}*`
                    }
                }
            )
            formattedBlocks.push(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `_${ele.description}_`
                    },
                    "accessory": {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": `Go To: ${ele.pkg}`,
                            "emoji": true,
                        },
                        "url": `${ele.link}`,
                        "style": "primary",
                        "action_id": "button-action"
                    }
                },
                {
                    "type": "divider"
                }
            )
        })

        
        client.chat.postMessage({
            channel: req.body.channel_id,
            blocks: formattedBlocks    
        })
        
    })
