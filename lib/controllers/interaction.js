const { Router } = require('express')
const { WebClient } = require("@slack/web-api")
const client = new WebClient(process.env.SLACK_BOT_TOKEN)
const fetch = require('node-fetch');
const { calendarDataParser, dateParser } = require('../utils/calendar-utils');
const Meeting = require('../models/meeting');

module.exports = Router()
    /* 

    This end point should parse and respond to all Slack Interactivity Requests: block_actions, view_submissions, etc.

    */
    .post('/', async (req, res, next) => {
        const parsed = JSON.parse(req.body.payload)

        //Confirm reciept modal submission
        res.send()
        // res.send({response_action: 'clear'})

        if(parsed.type === 'block_actions' && parsed.actions[0].action_id === 'ZOOM PARTICIPANTS MODAL'){
            try {
                res.send(); //prevents the 'operation_timeout' error that occurs
                fetch(
                  `https://alchemeetings.alchemycodelab.io/api/v1/meetings/${parsed.actions[0].value}`,
                  {
                    headers: {
                      'X-API-KEY': process.env.ZOOM_API_KEY,
                    },
                  }
                )
                  .then((response) => response.json())
                  .then((data) => {
                    const { name: Room, joinUrl: Link, participants } = data;
                    const Participants = participants.map((e) => e.name);
          
                    //checks if room is empty
                    function participantsChecker(Participants) {
                      const partiCheck = Participants.toString();
            
                      if (!partiCheck) return 'None';
                      return `\n - ` + Participants.join(`, \n - `);
                    }
                    client.views.open({
                      trigger_id: parsed.trigger_id,
                      view: {
                        "type": "modal",
                        "title": {
                          "type": "plain_text",
                          "text": "Alchemy Zoom Room Info"
                        },
                        "close": {
                          "type": "plain_text",
                          "text": "Close"
                        },
                        "blocks": [
                          {
                            "type": "section",
                            "text": {
                              "type": "mrkdwn",
                              "text": `<${Link}|${Room} (Click Here)>`
                            }
                          },
                          {
                            "type": "context",
                            "elements": [
                              {
                                "type": "mrkdwn",
                                "text": `Participants: ${participantsChecker(Participants)}`
                              }
                            ]
                          }
                        ]
                      }
                    });
                  });
                } catch (error) {
                console.log(error.data);
              }
        }

        if (parsed.type === 'view_submission' && parsed.view.private_metadata === 'MEETING MODAL') {
                    
            /*
            Parse incoming modal data
            */
            const {meetingTopic, meetingUsers, meetingDate, meetingTime} = await calendarDataParser(parsed)


            /* 
            Get current time, and meeting time from request to compare dates.
            Uses UTC?
            */
            const parsedDate = await dateParser(meetingDate, meetingTime)
            

            /*
            Open a direct message to the included users;
            Send message to that group with a topic.
            TODO 
                Save DM channel to DB and allow bot to send messages/reminder based on time to group again.
            */

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
                      "text": `Date: \n ${parsedDate.toString()}`
                    }
                  },
                  {
                    "type": "divider"
                  }
                ]
            })

            const getWelcomeLink = await client.chat.getPermalink({
              channel: meetingWelcomeMsg.channel,
              message_ts: meetingWelcomeMsg.message.ts
            })

            const createdMeeting = await Meeting.createMeeting(
              parsed.user.id, 
              meetingUsers, 
              meetingTopic, 
              parsedDate, 
              getWelcomeLink.permalink,
            )


            /*
            Second modal to state scheduled meeting to users
            TODO Possible confirmation before sending message to group?
            */
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