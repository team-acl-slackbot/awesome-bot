const { Router } = require('express');
const { WebClient } = require('@slack/web-api');
const client = new WebClient(process.env.SLACK_BOT_TOKEN);
const fetch = require('node-fetch');
const verifyToken = require('../middleware/verify-token');

module.exports = Router()
  .post('/', verifyToken, async (req, res, next) => {
    try {
      res.send(); //prevents the 'operation_timeout' error that occurs
      fetch('https://alchemeetings.alchemycodelab.io/api/v1/meetings/', {
        headers: {
          'X-API-KEY': process.env.ZOOM_API_KEY,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const roomName = data.map((room) => room.name);
          const roomId = data.map((room) => room.zoomId);
          const roomLink = data.map((room) => room.joinUrl);

          //used to accumulate all the rooms into a single response
          let aggregateBlock = [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*Here are all the Zoom rooms for Alchemy!* :+1:',
              },
            },
            {
              type: 'divider',
            },
          ];

          //iterates through each room's info in the array and pushes it on to the aggregateBlock
          for (let i = 0; i < data.length; i++) {
            aggregateBlock.push(
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `<${roomLink[i]}|${roomName[i]}>`,
                },
                accessory: {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'Info',
                    emoji: true,
                  },
                  value: `${roomId[i]}`,
                  action_id: 'ZOOM PARTICIPANTS MODAL', //used in interaction.js to find which if statement to use
                },
              },
              {
                type: 'divider',
              }
            );
          }

          //returns response to the channel
          client.chat.postMessage({
            channel: req.body.channel_id,
            blocks: aggregateBlock,
          });
        });
    } catch (error) {
      console.log(error.data);
    }
  });
