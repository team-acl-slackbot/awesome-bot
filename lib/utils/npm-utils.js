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

module.exports = {
    npmScraper,
}