const { Router } = require('express');
const { WebClient } = require('@slack/web-api');
const client = new WebClient(process.env.SLACK_TOKEN);
const fetch = require('node-fetch');
const verifyToken = require('../middleware/verify-token');
require('dotenv').config();

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
                  action_id: 'button-action123',
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
  })
  .post('/participants', async (req, res, next) => {
    //payload that generates when the button is clicked
    const payload = JSON.parse(req.body.payload);
    try {
      res.send(); //prevents the 'operation_timeout' error that occurs
      fetch(
        `https://alchemeetings.alchemycodelab.io/api/v1/meetings/${payload.actions[0].value}`,
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

          function participantsChecker(Participants) {
            const partiCheck = Participants.toString();
  
            if (!partiCheck) return 'None';
            return `\n - ` + Participants.join(`, \n - `);
          }
          client.views.open({
            trigger_id: payload.trigger_id,
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
  })