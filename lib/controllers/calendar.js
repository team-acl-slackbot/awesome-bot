const { Router } = require('express')

module.exports = Router()

    .post('/', (req, res, next) => {
        res.send('got it')
    })