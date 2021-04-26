const { Router } = require('express')
const { WebClient } = require("@slack/web-api")
const client = new WebClient(process.env.SLACK_BOT_TOKEN)



module.exports = Router()

    .post('/', async (req, res, next) => {
        console.log(req.headers)
        console.log(req.body)

        /*
        Opens/sends calendar meeting modal after calling the calendar meeting endpoint
        */
       if (req.body.text.split(' ').includes('meet')){
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
        console.log(parsed)

        /*
        Parse incoming modal data
        TODO How to check to confirm that modal is from /cal?
        */

        const {block_id: topicBlockId} = parsed.view.blocks.find(input => input.label.text === 'Meeting Topic')
        const {block_id: usersBlockId} = parsed.view.blocks.find(input => input.label.text === 'Invited Users:')
        
        const {'plain_text_input-action': topicInput} = parsed.view.state.values[topicBlockId]
        const {'multi_users_select-action': usersInput} = parsed.view.state.values[usersBlockId]

        const meetingTopic = topicInput['value']
        const meetingUsers = usersInput['selected_users'].join(',')
        

        res.send({response_action: 'clear'})

        /*
        Open a direct message to the included users;
        Send message to that group with a topic.

        */
        const directMsg = await client.conversations.open({
            users: `${parsed.user.id},${meetingUsers}`
        })

        await client.chat.postMessage({
            channel: directMsg.channel.id,
            text: meetingTopic,
        })

        /*
        Second modal to state scheduled meeting to users
        TODO Possible confirmation before sending message to group?
        */
        const formattedUsers = usersInput['selected_users'].map(ele => `<@${ele}>`).join(', ')

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
                            "text": `Meeting scheduled with ${formattedUsers} about ${meetingTopic}`
                        },
                    }
                ]
            }
        }) 
        
    })