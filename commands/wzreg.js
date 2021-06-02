const { Message, Client } = require('discord.js')
const { db } = require('../utility')
const { DBUser } = db
const axios = require('axios').default
const constants = require('../constants.json')

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * @description Usage: .wzreg <usertag> <playform>
    */
    async (args, msg, client) => {
        const usertag = args[0]
        if(!usertag) {
            msg.channel.send(':no_entry_sign: Ошибка, не указано имя пользователя !')
            return
        }
        const platform = args[1]
        if(!platform) {
            msg.channel.send(':no_entry_sign: Ошибка, не указана платформа !\nПоддерживаемые платформы:\n\nº**BattleNet** *(пиши в команде `battle` в параметре платформы)*\nº**Activision** *(пиши в команде `atvi` в параметре платформы)*\nº**Playstation** *(пиши в команде `?` в параметре платформы)*\nº**Xbox** *(пиши в команде `?` в параметре платформы)*')
            return
        }
        var link = ''
        switch(platform) {
            case 'battle':
                link = `https://cod.tracker.gg/warzone/profile/battlenet/${usertag.replace('#', '%23')}/detailed`
                break
            case 'atvi':
                link = `https://cod.tracker.gg/warzone/profile/atvi/${usertag.replace('#', '%23')}/detailed`
                break
            default:
                msg.channel.send(':no_entry_sign: Ошибка, указана неверная платформа !\nПоддерживаемые платформы:\n\nº**BattleNet** *(пиши в команде `battle` в параметре платформы)*\nº**Activision** *(пиши в команде `atvi` в параметре платформы)*\nº**Playstation** *(пиши в команде `?` в параметре платформы)*\nº**Xbox** *(пиши в команде `?` в параметре платформы)*')
                break
        }
        axios.get(`https://cod.tracker.gg/warzone/profile/battlenet/${usertag.replace('#', '%23')}/detailed`)
            .then(async response => {
                if(!msg.member.roles.cache.get(constants.roles.wz))
                    msg.member.roles.add(constants.roles.wz)

                const user = await new DBUser(msg.guild.id, msg.author.id)
                user.wz = usertag
                await user.save()
                msg.channel.send(`:white_check_mark: ${msg.author}, Ваш профиль <@&737619245487095889> успешно закреплен | ${usertag}`)
            })
            .catch(err => {
                if(err.response.status == '404')
                    msg.channel.send(':no_entry_sign: Ошибка, профиль не найден!')
            })
    }