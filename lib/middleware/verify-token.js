const { createHmac, timingSafeEqual } = require('crypto')
const qs = require('qs');

const verifyToken = (req, res, next) =>{
    //grab slack signature and timestamp from request headers
    const slackSignature = req.headers['x-slack-signature'];

    const timestamp = req.headers['x-slack-request-timestamp'];

    //grab slack payload from request body and convert to query string so it can be used to calculate hmac
    const rawPayload = qs.stringify(req.body,{ format:'RFC1738' });

    //concat version number, timestamp and raw payload to form basestring
    const basestring = `v0:${timestamp}:${rawPayload}`;

    //use built-in crypto library to compute signature using slack signing secret and basestring
    const computedSignature = 'v0='+ createHmac('sha256',process.env.SLACK_SIGNING_SECRET)
        .update(basestring)
        .digest('hex')

    //use timingSafeEqual from crypto library to compare computed signature and slack signature
    //both signatures must be convereted to buffers to be compared
    //timingSafeEqual returns a boolean
    console.log(computedSignature, slackSignature)
    if(timingSafeEqual(
        Buffer.from(computedSignature, 'utf-8'),
        Buffer.from(slackSignature, 'utf-8'))){
        next()
    } else {
        return res.send('Error: Verification Failed')
    }
}
module.exports=verifyToken;


