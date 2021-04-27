const { Router } = require('express');
const { WebClient } = require('@slack/web-api')
const client = new WebClient(process.env.SLACK_BOT_TOKEN)
const fetch = require('node-fetch')
const verifyToken = require('../middleware/verify-token')

const freeRoute = require('../zoom/free-route');

module.exports= Router()

.post('/free', verifyToken, async (req, res, next) => { 
    res.send();
    
    if (req.body.text.toLowerCase() === 'free') {
        try {
            freeRoute(req.body.channel_id);             
        }
        
        catch (error) {
            next(error)
        }
    }
})