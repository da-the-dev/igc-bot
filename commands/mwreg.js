const { Message, Client } = require('discord.js')
const { trackerRegister } = require('../utility')

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * @description Usage: .mwreg <usertag> <platform>
    */
    async (args, msg, client) => {
        trackerRegister(msg, args, 'modern-warfare')
    }