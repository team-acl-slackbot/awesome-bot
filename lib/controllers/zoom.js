const { Router } = require('express');
const { WebClient } = require('@slack/web-api');
const client = new WebClient(process.env.SLACK_BOT_TOKEN);
const fetch = require('node-fetch');
const verifyToken = require('../middleware/verify-token');
const userRoute = require('../zoom/username-route');
const freeRoute = require('../zoom/free-route')
const { fetchAllRooms, aggregateBlock } = require('../utils/zoom-utils')

module.exports = Router()
  .post('/', verifyToken, async (req, res, next) => {
    res.send()
    if(req.body.text.length === 0){
        try {
          fetchAllRooms()
            .then((data) => {
            //returns response to the channel
            client.chat.postMessage({
                channel: req.body.channel_id,
                blocks: aggregateBlock(data),
            });
        });
        } catch (error) {
            console.log(error.data);
        }
    }
        
    if (req.body.text.toLowerCase() === 'free') {
        try {
                freeRoute(req.body.channel_id)             
        }   
        catch (error) {
            next(error)
        }
    } if (req.body.text.length >= 1 && req.body.text.toLowerCase() !== 'free'){
        try {
             userRoute(req.body.text, req.body.channel_id )
        }
        catch (error) {
            next(error);
        }
        }

  });
