const { Router } = require('express')
const { WebClient } = require("@slack/web-api")
const client = new WebClient(process.env.SLACK_BOT_TOKEN)



module.exports = Router()

    .post('/', async (req, res, next) => {
        console.log(req.headers)
        console.log(req.body)

        /*
        Opens/sends calendar meeting modal after calling the calendar meeting endpoint

        TODO
            Move Blockkit modal view to new file?
        */
        if (req.body.text.split(' ').includes('meet')){
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

           res.send('Calendar Modal Opened')
       }
       else {
           res.send(`Error: \n\n Must include argument after /cal (meet, task)`)
       }
    
    })


    /* 
    Need to move this end-point to a less specific endpoint for other end point to use it.

    '/slack/interaction/'?

    */
    .post('/modal', async (req, res, next) => {
        const parsed = JSON.parse(req.body.payload)
        // console.log(parsed)
        // console.log(parsed.view.state.values)

        
        if (parsed.type === 'view_submission' && parsed.view.private_metadata === 'MEETING MODAL') {
            console.log('this is for the meeting modal!')
        }

        /*
        Parse incoming modal data
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


        //Confirm reciept modal submission and clear old modal away.
        res.send({response_action: 'clear'})


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
        
    })