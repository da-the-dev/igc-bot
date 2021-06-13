const { Message, Client } = require('discord.js')
const { tracker } = require('../utility')

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * @description Usage: .cwclear
    */
    async (args, msg, client) => {
        tracker.clear(msg, 'cold-war')
    }