const { Router } = require('express')

const qs = require('qs')
const fetch = require('node-fetch')
const cheerio = require('cheerio')

const { WebClient } = require("@slack/web-api")
const client = new WebClient(process.env.SLACK_BOT_TOKEN)


module.exports = Router()
    .post('/', async (req, res, next) => {
 
        res.send()

        /*
        Convert text string to url query format for fetch, then fetch results.
        */
        const query = qs.stringify({q: req.body.text}, { format:'RFC1738' })

        fetch(`https://www.npmjs.com/search?${query}`)
            .then(res => res.text())
            .then(res => {
                const $ = cheerio.load(res)
                let pkgTitlesLinks = [];
                let pkgDescription = []
                
                /* 
                Loop through H3 elements and collect package titles and href links.
                */
                $('h3').each( function (i, e) {
                    pkgTitlesLinks.push({
                        pkg: $(this).text(), 
                        link: `https://www.npmjs.com${$(this).parent().attr('href')}`
                    })
                })

                /* 
                Loop through p elements and collect package descriptions.
                */
                $('p').each( function (i, e) {
                    pkgDescription.push($(this).text())
                })

                /* 
                Eliminate extra nodes of incorrect data and merge two objects together.
                */                
                pkgTitlesLinks = pkgTitlesLinks.slice(0,-3)
                pkgDescription = pkgDescription.slice(1)

                for (let x = 0; x < pkgTitlesLinks.length; x++){
                    pkgTitlesLinks[x]['description'] = pkgDescription[x]
                }


                const formattedBlocks = [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `+++++ \n Top 3 search results for *${req.body.text}* @ npmjs: \n +++++`
                        }
                    },
                    {
                        "type": "divider"
                    },
                ]

                pkgTitlesLinks.slice(0, 3).forEach(ele => {
                    formattedBlocks.push(
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": `*${ele.pkg}*`
                            }
                        }
                    )
                    formattedBlocks.push(
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": `_${ele.description}_`
                            },
                            "accessory": {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": `Go To: ${ele.pkg}`,
                                    "emoji": true,
                                },
                                "url": `${ele.link}`,
                                "style": "primary",
                                "action_id": "button-action"
                            }
                        },
                        {
                            "type": "divider"
                        }
                    )
                })

                
                client.chat.postMessage({
                    channel: req.body.channel_id,
                    blocks: formattedBlocks    
                })
                
            })

    })
