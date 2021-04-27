const { Router } = require('express')
const qs = require('qs')
const { WebClient } = require("@slack/web-api")
const client = new WebClient(process.env.SLACK_BOT_TOKEN)
const { npmScraper, generateNpmBlocks } = require('../utils/npm-utils')
const verifyToken = require('../middleware/verify-token')

module.exports = Router()
    .post('/', verifyToken, async (req, res, next) => {
        
        // ack request
        res.send()
        
        /*
        Convert text string to url query format for fetch, then fetch scraping results.
        */
        const rawTextInput = req.body.text
        const parsedQuery = qs.stringify({q: rawTextInput}, { format:'RFC1738' })
        
        const scrapedData = await npmScraper(parsedQuery)
 
        /* 
        Format all Blockit sections before sending message to channel.

        TODO add ability to parse for # of results.
        */
        const parsedBlocks = await generateNpmBlocks(rawTextInput, scrapedData)

        // Send formatted results to channel.
        const postMessage = await client.chat.postMessage({
            channel: req.body.channel_id,
            blocks: parsedBlocks    
        })
        
    })
