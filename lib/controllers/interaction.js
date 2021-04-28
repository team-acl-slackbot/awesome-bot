const { Router } = require('express')
const { WebClient } = require("@slack/web-api")
const client = new WebClient(process.env.SLACK_BOT_TOKEN)
const fetch = require('node-fetch');
const openHelpModal = require('../utils/help-modal');
const { fetchRooms, clientModal } = require('../utils/zoom-utils');
const { calendarDataParser, dateParser } = require('../utils/calendar-utils');

module.exports = Router()
    /* 

    This end point should parse and respond to all Slack Interactivity Requests: block_actions, view_submissions, etc.

    */
    .post('/', async (req, res, next) => {
        const parsed = JSON.parse(req.body.payload)
        console.log(parsed)
        // console.log(parsed.view.state.values)

        //Confirm reciept modal submission
        res.send()
        // res.send({response_action: 'clear'})

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

        if (parsed.type === 'view_submission' && parsed.view.private_metadata === 'MEETING MODAL') {
                    
            /*
            Parse incoming modal data
            */
            const {meetingTopic, meetingUsers, meetingDate, meetingTime} = await calendarDataParser(parsed)


            /* 
            Get current time, and meeting time from request to compare dates.
            Uses UTC?
            */
            const currentTime = new Date()
            const parsedDate = await dateParser(meetingDate, meetingTime)
            
            console.log(currentTime.toString())
            console.log(currentTime.toISOString())
            console.log(parsedDate.toString())
            

            /* 
            TODO
            DB Call:
            requester | dm channel | invited users | topic | time created | time of meeting
            */


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

            await client.chat.postMessage({
                channel: directMsg.channel.id,
                text: `Meeting about ${meetingTopic} scheduled for ${meetingDate} at ${meetingTime}.`,
            })


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
