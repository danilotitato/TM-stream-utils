const express = require('express');
const req = require('express/lib/request');
const emoteList = require('../services/misc/emote.js');
const emoteRouter = express.Router();

const isInputValidString = require('../utils/validate-input.js').isInputValidString;

var service_list = [
    // 'all',
    'channel',
    'twitch',
    '7tv',
    'betterttv',
    'bttv',
    'frankerfacez',
    'ffz'
]

emoteRouter.get('/', async (req, res) => {
    if(typeof req.query.username !== 'undefined'){
        if(typeof req.query.service !== 'undefined'){
            const username = req.query.username
            const service = req.query.service.toLowerCase()
            page = 1

            if(typeof req.query.page !== 'undefined'){
                if(parseInt(req.query.page, 10) > 0){
                    page = parseInt(req.query.page)
                }
            }

            if(service_list.includes(service)){
                res.send(await emoteList(username, service, page))
            }else{
                res.status(400).send('Unknown service. Following supported services: '+ service_list.join(', '))
            }
        }else{
            res.status(400).send('Please specify a service. Following supported services: '+ service_list.join(', '))
        }
    }else{
        res.status(400).send('Please specify a username.')
    }
});

module.exports = emoteRouter;
