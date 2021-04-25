const { Router } = require('express')
const { WebClient } = require("@slack/web-api")
const client = new WebClient(process.env.SLACK_BOT_TOKEN)



module.exports = Router()

    .post('/', async (req, res, next) => {
        const open = await client.views.open({
            trigger_id: req.body.trigger_id,
            view: {
                "type": "modal",
                "title": {
                    "type": "plain_text",
                    "text": "Schedule a Meeting:",
                    "emoji": true
                },
                "submit": {
                    "type": "plain_text",
                    "text": "Schedule",
                    "emoji": true
                },
                "close": {
                    "type": "plain_text",
                    "text": "Cancel",
                    "emoji": true
                },
                "blocks": [
                    {
                        "type": "input",
                        "element": {
                            "type": "plain_text_input",
                            "action_id": "plain_text_input-action",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Enter the meeting's topic:",
                                "emoji": true
                            }
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Meeting Topic",
                            "emoji": true
                        }
                    },
                    {
                        "type": "input",
                        "element": {
                            "type": "multi_users_select",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Users:",
                                "emoji": true
                            },
                            "action_id": "multi_users_select-action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Invited Users:",
                            "emoji": true
                        }
                    }
                ]
            }
        })
    
        console.log(open)
    
        res.send('Calendar Modal Opened')
    })

    .post('/modal', async (req, res, next) => {
        const parsed = JSON.parse(req.body.payload)
        console.log(parsed)
        
        res.send({response_action: 'clear'})

        const update = await client.views.open({
            trigger_id: parsed.trigger_id,
            view: {
                "type": "modal",
                "title": {
                    "type": "plain_text",
                    "text": "My App",
                    "emoji": true
                },
                blocks: [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "Meeting scheduled"
                        },
                    }
                ]
            }
        }) 
        
    })