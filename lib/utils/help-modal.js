
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
                "text":`*/canvas* to view a list of your upcoming canvas assignments\n*/alchzoom* to access the alchmeetings rooms`
              }
            },{
                "type":"context",
                "elements":[{
                    "type":"mrkdwn",
                    "text":"Don't forget to include the '/' before each command"
                }]
            }
          ]
        }
      });
}
module.exports = openHelpModal;