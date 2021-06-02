const { Message, Client } = require('discord.js')
const { db } = require('../utility')
const { DBUser } = db

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * @description Usage: .wzreg <usertag>
    */
    async (args, msg, client) => {
        const usertag = args[0]
        if(!usertag) {
            msg.channel.send(':no_entry_sign: Ошибка, не указано имя пользователя !')
            return
        }
        const user = await new DBUser(msg.guild.id, msg.author.id)
        user.wz = usertag
        await user.save()
        msg.channel.send(`:white_check_mark: ${msg.author}, Ваш профиль <@&737619245487095889> успешно закреплен | ${usertag}`)
    }