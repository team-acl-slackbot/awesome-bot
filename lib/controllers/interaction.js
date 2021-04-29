const { Router, json } = require('express')
const { WebClient } = require("@slack/web-api")
const client = new WebClient(process.env.SLACK_BOT_TOKEN)
const fetch = require('node-fetch');
const openHelpModal = require('../utils/help-modal');
const { fetchRooms, clientModal } = require('../utils/zoom-utils');
const { calendarDataParser, dateParser } = require('../utils/calendar-utils');
const Meeting = require('../models/meeting');

const userClient = new WebClient(process.env.SLACK_USER_TOKEN)

module.exports = Router()
    /* 

    This end point should parse and respond to all Slack Interactivity Requests: block_actions, view_submissions, etc.

    */
    .post('/', async (req, res, next) => {
        const parsed = JSON.parse(req.body.payload)

        res.send()

        if(parsed.type === 'block_actions' && parsed.actions[0].action_id === 'help'){
            res.send();
            try {
                 await openHelpModal(parsed) 
            } catch (error) {
                next(error)
            }
        }
        
        if(parsed.type === 'block_actions' && parsed.actions[0].action_id === 'ZOOM PARTICIPANTS MODAL'){
            try {
              fetchRooms(parsed)
                .then((response) => response.json())
                .then((data) => {
                  clientModal(data, parsed);
                });
              } catch (error) {
                console.log(error.data);
              }
        }

        if(parsed.type === 'block_actions' && parsed.actions[0].action_id === 'set-Meeting-Reminder'){

          const {topic, date, channel} = JSON.parse(parsed.actions[0].value)
          unixDate = new Date(date).getTime()

          const createReminder = await userClient.reminders.add({
            text: `Meeting about ${topic} | <https://teamslackbotworkspace.slack.com/archives/${channel}|Meeting Link>`,
            // meeting time - 30 minutes
            time: (unixDate / 1000) - (60 * 30),
            user: parsed.user.id
          })

        }
        if(parsed.type === 'block_actions' && parsed.actions[0].action_id === 'delete-meeting-btn'){

          const deleteMeeting = await Meeting.deleteMeetingById(parsed.actions[0].value)

          if (deleteMeeting){
            const deleteMessage = await client.chat.postMessage({
              channel: parsed.channel.id,
              "blocks": [
                {
                  "type": "divider"
                },
                {
                  "type": "header",
                  "text": {
                    "type": "plain_text",
                    "text": "MEETING CANCELLED",
                    "emoji": true
                  }
                },
                {
                  "type": "context",
                  "elements": [
                    {
                      "type": "mrkdwn",
                      "text": `Meeting cancelled by: <@${parsed.user.id}>`
                    }
                  ]
                },
                {
                  "type": "context",
                  "elements": [
                    {
                      "type": "mrkdwn",
                      "text": `Cancelled on: ${new Date().toString()}`
                    }
                  ]
                },
                {
                  "type": "divider"
                }
              ]
            })
          }

        }


        if (parsed.type === 'view_submission' && parsed.view.private_metadata === 'MEETING MODAL') {
                    
            
            // Parse incoming modal data
            const {meetingTopic, meetingUsers, meetingDate, meetingTime} = await calendarDataParser(parsed)



            // Parse meeting time from request
            const parsedDate = await dateParser(meetingDate, meetingTime)

            console.log(parsedDate)
            


            // Open a direct message to the included users & send message to that group with details.
            const dmFormattedUsers = meetingUsers.join(',')

            const directMsg = await client.conversations.open({
                users: `${parsed.user.id},${dmFormattedUsers}`
            })

            const meetingWelcomeMsg = await client.chat.postMessage({
                channel: directMsg.channel.id,
                blocks: [
                  {
                    "type": "header",
                    "text": {
                      "type": "plain_text",
                      "text": "Meeting Scheduled",
                      "emoji": true
                    }
                  },
                  {
                    "type": "context",
                    "elements": [
                      {
                        "type": "mrkdwn",
                        "text": `A meeting has been scheduled by: <@${parsed.user.id}>`
                      }
                    ]
                  },
                  {
                    "type": "context",
                    "elements": [
                      {
                        "type": "mrkdwn",
                        "text": `Invited Users: ${meetingUsers.map(u => `<@${u}>`).join(', ')}`
                      }
                    ]
                  },
                  {
                    "type": "section",
                    "text": {
                      "type": "mrkdwn",
                      "text": `*Topic*: \n ${meetingTopic}`
                    }
                  },
                  {
                    "type": "section",
                    "text": {
                      "type": "mrkdwn",
                      "text": `Date: \n ${parsedDate.toLocaleString()}`
                    }
                  },
                  {
                    "type": "divider"
                  },
                  {
                    "type": "actions",
                    "elements": [
                      {
                        "type": "button",
                        "text": {
                          "type": "plain_text",
                          "text": "Remind me 30 minutes before!",
                          "emoji": true
                        },
                        "value": JSON.stringify({topic: meetingTopic, date: parsedDate, channel: directMsg.channel.id}),
                        "action_id": "set-Meeting-Reminder"
                      }
                    ]
                  }
                ]
            })

            // Get the permalink for the first message
            const getWelcomeLink = await client.chat.getPermalink({
              channel: meetingWelcomeMsg.channel,
              message_ts: meetingWelcomeMsg.message.ts
            })

            // Create DB entry for meeting.
            const createMeetingDbEntry = await Meeting.createMeeting(
              parsed.user.id, 
              meetingUsers, 
              meetingTopic, 
              parsedDate, 
              getWelcomeLink.permalink,
            )

            const deleteButton = await client.chat.postMessage({
              channel: directMsg.channel.id,
              blocks: [
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": {
                        "type": "plain_text",
                        "text": "CANCEL Meeting",
                        "emoji": true
                      },
                      "value": createMeetingDbEntry.id,
                      "action_id": "delete-meeting-btn"
                    }
                  ]
                }
              ] 
            })


            // Second modal to state scheduled meeting to users
            const modalFormattedUsers = meetingUsers.map(ele => `<@${ele}>`).join(', ')

            const confirmationAlert = await client.views.open({
                trigger_id: parsed.trigger_id,
                view: {
                    "type": "modal",
                    "title": {
                        "type": "plain_text",
                        "text": "Meeting Scheduled!",
                        "emoji": true
                    },
                    blocks: [
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": `Meeting scheduled with ${modalFormattedUsers} about ${meetingTopic} on ${meetingDate} at ${meetingTime}.`
                            },
                        }
                    ]
                }
            }) 
        }

        
    })
