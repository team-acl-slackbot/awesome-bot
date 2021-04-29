const express = require('express');
const app = express();
const { WebClient } = require('@slack/web-api');
const client = new WebClient(process.env.SLACK_BOT_TOKEN);
const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
app.use('/slack/events', slackEvents.requestListener());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/slack/zoom', require('./controllers/zoom'));
app.use('/slack/canvas', require('./controllers/canvas'));
app.use('/slack/calendar', require('./controllers/calendar'));
app.use('/slack/npm', require('./controllers/npm'));
app.use('/slack/futurama', require('./controllers/fun-stuff'));
app.use('/slack/gradechange', require('./controllers/all-a'));

app.use('/slack/interaction', require('./controllers/interaction'));

slackEvents.on('app_mention', (event) => {
    (async () => {
        try {
            await client.chat.postMessage({
                channel: event.channel,
                blocks: [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `Hello <@${event.user}>! Click the help button to view a list of my commands`
                        },
                        "accessory": {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Help",
                                "emoji": true
                            },
                            "value": "click_me_123",
                            "action_id": "help"
                        }
                    }
                ]
            })
        } catch (error) {
            console.error(error)
        }
    })()
});
app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));


module.exports = app;
