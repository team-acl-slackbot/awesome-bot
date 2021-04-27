const fetch = require('node-fetch')
const cheerio = require('cheerio')

const npmScraper = async (query) => {

    const npmFetch = await fetch(`https://www.npmjs.com/search?${query}`)
    const npmText = await npmFetch.text()

    // Load raw text into Cheerio parser.
    const $ = cheerio.load(npmText)

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


    return pkgTitlesLinks

}


const generateNpmBlocks = async (query, data, numResults = 3) => {
    const formattedBlocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `+++++ \n Top ${numResults} search results for *${query}* @ npmjs: \n +++++`
            }
        },
        {
            "type": "divider"
        },
    ]

    data.slice(0, numResults).forEach(ele => {
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

    return formattedBlocks
}


module.exports = {
    npmScraper,
    generateNpmBlocks
}