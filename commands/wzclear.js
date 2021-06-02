const { Message, Client } = require('discord.js')
const { db } = require('../utility')
const { DBUser, getConnection } = db
const constants = require('../constants.json')
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * @description Usage: .wzclear
    */
    async (args, msg, client) => {
        const user = await new DBUser(msg.guild.id, msg.author.id)
        delete user.wz
        user.save()
        msg.channel.send(`:white_check_mark: ${msg.author}, Ваш профиль <@&737619245487095889> успешно откреплен`)
    }