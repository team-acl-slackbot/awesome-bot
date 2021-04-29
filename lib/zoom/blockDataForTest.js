const blockDataForTest = [{
  type: 'section',
  text: {
      type: 'mrkdwn',
      text: '*Here are all the Zoom rooms for Alchemy!* :+1:',
  }
},
{
    type: 'divider',
},
{
  type: 'section',
  text: {
      type: 'mrkdwn',
      text: `<https://zoom.us/j/498946105?pwd=TnFCSmpRTDBua1ZlZGRObVc1U0VXdz09|Community & Current Events>`,
  },
  accessory: {
      type: 'button',
      text: {
          type: 'plain_text',
          text: 'Info',
          emoji: true,
      },
      value: `498946105`,
      action_id: 'ZOOM PARTICIPANTS MODAL', //used in interaction.js to find which if statement to use
  },
  },
  {
  type: 'divider',
  },
  {
    type: 'section',
    text: {
        type: 'mrkdwn',
        text: `<https://zoom.us/j/2090393356?pwd=YmdBTUFCVlUwOHYvWkZSeXlZSHNLQT09|Mercury Room's Personal Meeting Room>`,
    },
    accessory: {
        type: 'button',
        text: {
            type: 'plain_text',
            text: 'Info',
            emoji: true,
        },
        value: `2090393356`,
        action_id: 'ZOOM PARTICIPANTS MODAL', //used in interaction.js to find which if statement to use
    },
    },
    {
    type: 'divider',
    },
]

module.exports = {
  blockDataForTest
}