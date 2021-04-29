const { Router } = require('express')
const { WebClient } = require("@slack/web-api")
const Meeting = require('../models/meeting')
const client = new WebClient(process.env.SLACK_BOT_TOKEN)



module.exports = Router()

.post('/', async (req, res, next) => {
    
    /*
    Opens/sends calendar meeting modal after calling '/cal meet' 
    */
        if (req.body.text.split(' ').includes('meet')){
            res.send('Calendar Modal Opened')

            const open = await client.views.open({
               trigger_id: req.body.trigger_id,
               view: {
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
                "type": "modal",
                "close": {
                    "type": "plain_text",
                    "text": "Cancel",
                    "emoji": true
                },
                "private_metadata": 'MEETING MODAL',
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
                    },
                    {
                        "type": "input",
                        "element": {
                            "type": "datepicker",
                            "initial_date": "2021-04-28",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Select a date",
                                "emoji": true
                            },
                            "action_id": "datepicker-action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Meeting Date:",
                            "emoji": true
                        }
                    },
                    {
                        "type": "input",
                        "element": {
                            "type": "timepicker",
                            "initial_time": "09:00",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Select time",
                                "emoji": true
                            },
                            "action_id": "timepicker-action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Meeting Time (24-hr)",
                            "emoji": true
                        }
                    }
                ]
                },     
            })
        }

        /*
        Opens/sends calendar meeting modal after calling '/cal list'
        */

        else if (req.body.text.split(' ').includes('list')){
            const getMeetings = await Meeting.getMeetingsByUser(req.body.user_id)
            
            if (!getMeetings){
                res.send(`+++ \n\n No meetings on the schedule! \n\n +++`)
            }
            else{
                res.send('Calendar Items Listed')

                getMeetings.forEach(meeting => {
                    const returnMeetings = client.chat.postEphemeral({
                        channel: req.body.channel_id,
                        user: req.body.user_id,
                        blocks: [
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": `Meeting Topic: ${meeting.topic}`
                                }
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": meeting.meetingUsers.map(u => `<@${u}>`).join(', ')
                                }
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": `Date: ${meeting.meetingDate.toLocaleString()}`
                                }
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": `LINK: <${meeting.dmPermalink}|Link to Meeting>`
                                }
                            },
                            {
                                "type": "divider"
                            }
                        ]
                        
                    })
                    
                })
            }

        }

        else {
            res.send(`Error: \n\n Must include argument after /cal (meet or list)`)
        }
    
    })

