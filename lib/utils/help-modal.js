
const { WebClient } = require("@slack/web-api")
const client = new WebClient(process.env.SLACK_BOT_TOKEN)

const openHelpModal = async (payload) =>{
    await client.views.open({
        trigger_id: payload.trigger_id,
        view: {
          "type": "modal",
          "title": {
            "type": "plain_text",
            "text": "AwesomeBot Commands"
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
                "text": "*Welcome to the help page! Here are all the commands I can use.*\n`/canvas` shows a list of your upcoming canvas assignments!\n>\n`/alchzoom` shows all the Alchemy's Zoom rooms!\n>`/alchzoom free` displays all empty rooms.\n>`/alchzoom keyword` displays anyone with that keyword in their Zoom name.\n`/cal` will let you set up meetings with fellow users.\n>`/cal meet` to set up a meeting\n>`/cal list` shows the meetings you've scheduled. \n`/npm` will find you a specific npm package from npmjs. Just type something with the command and watch the magic! \n`/futurama character-name` pays homage to the first API we used at Alchemy. Try it out!"
              }
            },{
                "type":"context",
                "elements":[{
                    "type":"mrkdwn",
                    "text":"Don't forget to include the '/' before each command!"
                }]
            }
          ]
        }
      });
}
module.exports = openHelpModal;