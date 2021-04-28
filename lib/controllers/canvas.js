const { Router } = require('express');
const verifyToken = require('../middleware/verify-token');
const {fetchAssignments, convertDueDate} = require('../utils/canvas-utils');
const { WebClient } = require('@slack/web-api');
const client = new WebClient(process.env.SLACK_BOT_TOKEN);

module.exports = Router()
    .post('/', verifyToken, async(req,res,next)=>{
        try {
            const date = new Date()
            //fetch assignment data from canvas api
            const assignmentData = await fetchAssignments();
            const assignmentBlocks = [{
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text":`👋 Hello! Here's a list of upcoming assignments and a <https://canvas.instructure.com/calendar#view_name=month&view_start=${date}|link to the course calendar>`
                }
            }]
            //loop through the assignments and format the data into blocks to be pushed into the assignmentBlocks array
            
            assignmentData.forEach(item=>{
                assignmentBlocks.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `*<${item.html_url}|${item.name}>*\nDue: ${convertDueDate(item.due_at)}\n`
                }
                },
                {
                    "type": "divider"
                }
                )
            })
            
           
            //the slack web api provides the chat.postmessage method to post the assignment data into slack
            if(assignmentData.length > 1){
                await client.chat.postMessage({
                    channel:req.body.channel_id,
                    blocks:assignmentBlocks,
    
                })
            }else{
                await client.chat.postMessage({
                    channel:req.body.channel_id,
                    blocks: [
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": `:shrug: *It looks like there are no assignments at this time*. Here's a <https://canvas.instructure.com/calendar#view_name=month&view_start=${date}|link to the course calendar>`
                            }
                        }
                    ]
                })
            }
            res.send()
        } catch (error) {
            next(error)
        }
    })