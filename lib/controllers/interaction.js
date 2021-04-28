const { Router } = require('express')
const { WebClient } = require("@slack/web-api")
const client = new WebClient(process.env.SLACK_BOT_TOKEN)
const fetch = require('node-fetch');
const openHelpModal = require('../utils/help-modal');
const { fetchRooms, clientModal } = require('../utils/zoom-utils');

module.exports = Router()
    /* 

    This end point should parse and respond to all Slack Interactivity Requests: block_actions, view_submissions, etc.

    */
    .post('/', async (req, res, next) => {
        const parsed = JSON.parse(req.body.payload)
        // console.log(parsed)
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
              res.send(); //prevents the 'operation_timeout' error that occurs
              fetchRooms(parsed)
                .then((response) => response.json())
                .then((data) => {
                  const { name: Room, joinUrl: Link, participants } = data;
                  const Participants = participants.map((e) => e.name);
        
                  clientModal(Room, Link, Participants, parsed);
                });
              } catch (error) {
                console.log(error.data);
              }
        }

        if (parsed.type === 'view_submission' && parsed.view.private_metadata === 'MEETING MODAL') {
                    
            /*
            Parse incoming modal data
            Move to UTILS
            TODO How to check to confirm that modal is from /cal?  parsed.view.title.text === 'Schedule a Meeting:'??
            */
            
            const { block_id: topicBlockId } = parsed.view.blocks.find(input => input.element.type === 'plain_text_input')
            const { block_id: usersBlockId } = parsed.view.blocks.find(input => input.element.type === 'multi_users_select')
            const { block_id: dateBlockId } = parsed.view.blocks.find(input => input.element.type === 'datepicker')
            const { block_id: timeBlockId } = parsed.view.blocks.find(input => input.element.type === 'timepicker')
            
            const {'plain_text_input-action': topicInput} = parsed.view.state.values[topicBlockId]
            const {'multi_users_select-action': usersInput} = parsed.view.state.values[usersBlockId]
            const {'datepicker-action': dateInput} = parsed.view.state.values[dateBlockId]
            const {'timepicker-action': timeInput} = parsed.view.state.values[timeBlockId]
            
            const meetingTopic = topicInput['value']
            const meetingUsers = usersInput['selected_users']
            const meetingDate = dateInput['selected_date']
            const meetingTime = timeInput['selected_time']
                
            const [ yr, mn, day ] = meetingDate.split('-')
            const [ hr, min ] = meetingTime.split(':')
            
            /* 
            Get current time, and meeting time from request to compare dates.
            Uses UTC?
            */
            const currentTime = new Date()
            const meetingFormattedTime = new Date(Number(yr), Number(mn) - 1, Number(day), Number(hr), Number(min), 0)

            console.log(currentTime)
            console.log(meetingFormattedTime)
            

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
            const modalFormattedUsers = usersInput['selected_users'].map(ele => `<@${ele}>`).join(', ')

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
