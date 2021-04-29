const { Router } = require('express');
const { WebClient } = require('@slack/web-api');
const client = new WebClient(process.env.SLACK_BOT_TOKEN);
const verifyToken = require('../middleware/verify-token');

module.exports = Router()

    .post('/', verifyToken, (req, res, next) => {
        res.send()
        if (req.body.text.length < 1) {
            client.chat.postMessage({
                channel: req.body.channel_id,
                blocks: [
                    {
                        'type': 'header',
                        'text': {
                            'type': 'plain_text',
                            'text': 'Congrats!!',
                            'emoji': true
                        }
                    },
                    {
                        'type': 'section',
                        'text': {
                            'type': 'plain_text',
                            'text': `You have sucessfully changed everyone's overall grade on canvas to 100% `,
                            'emoji': true
                        }
                    }
                ],
            });
        }
        if (req.body.text.length > 1) {
            client.chat.postMessage({
                channel: req.body.channel_id,
                blocks: [
                    {
                        'type': 'header',
                        'text': {
                            'type': 'plain_text',
                            'text': 'Congrats!!',
                            'emoji': true
                        }
                    },
                    {
                        'type': 'section',
                        'text': {
                            'type': 'plain_text',
                            'text': `You have sucessfully changed the overall grade of ${req.body.text} on canvas to 100%`,
                            'emoji': true
                        }
                    }
                ],
            });
        }

    })