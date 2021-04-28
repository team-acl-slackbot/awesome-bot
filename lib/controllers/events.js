const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const { WebClient } = require('@slack/web-api');
const client = new WebClient(process.env.SLACK_TOKEN);
const {Router} = require('express');
const { default: fetch } = require('node-fetch');

module.exports = Router()
    .post('/',slackEvents.requestListener,(req,res,next)=>{

        // if(req.body.type === 'url_verification'){res.send(req.body.challenge)}
        
        
    })
           

