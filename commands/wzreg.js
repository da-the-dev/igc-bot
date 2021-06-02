const { Message, Client } = require('discord.js')
const { db } = require('../utility')
const { DBUser, getConnection } = db
const axios = require('axios').default
const constants = require('../constants.json')
const platforms = 'Поддерживаемые платформы:\n\nº**BattleNet** *(пиши в команде `battlenet` в параметре платформы)*\nº**Activision** *(пиши в команде `atvi` в параметре платформы)*\nº**Playstation** *(пиши в команде `?` в параметре платформы)*\nº**Xbox** *(пиши в команде `?` в параметре платформы)*'
module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * @description Usage: .wzreg <usertag> <platform>
    */
    async (args, msg, client) => {
        const usertag = args[0]
        if(!usertag) {
            msg.channel.send(':no_entry_sign: Ошибка, не указано имя пользователя !')
            return
        }
        const platform = args[1]
        if(!platform) {
            msg.channel.send(':no_entry_sign: Ошибка, не указана платформа !\n' + platforms)
            return
        }

        const susUser = await getConnection().qget(msg.guild.id, { 'wz.usertag': usertag })
        if(susUser) {
            msg.channel.send(`:warning: Профиль <@&${constants.roles.wz}> ${usertag} уже закреплен за <@${susUser.id}>`)
            return
        }

        var link = ''
        switch(platform) {
            case 'battlenet':
                link = `https://cod.tracker.gg/warzone/profile/battlenet/${usertag.replace('#', '%23')}/detailed`
                break
            case 'atvi':
                link = `https://cod.tracker.gg/warzone/profile/atvi/${usertag.replace('#', '%23')}/detailed`
                break
            default:
                msg.channel.send(':no_entry_sign: Ошибка, указана неверная платформа !\n' + platforms)
                return
        }
        axios.get(`https://cod.tracker.gg/warzone/profile/${platform}/${usertag.replace('#', '%23')}/detailed`)
            .then(async response => {
                if(!msg.member.roles.cache.get(constants.roles.wz))
                    msg.member.roles.add(constants.roles.wz)

                const user = await new DBUser(msg.guild.id, msg.author.id)
                user.wz = { usertag: usertag, platform: platform }
                await user.save()
                msg.channel.send(`:white_check_mark: ${msg.author}, Ваш профиль <@&737619245487095889> успешно закреплен | ${usertag}`)
            })
            .catch(err => {
                if(err.response.status == '404')
                    msg.channel.send(':no_entry_sign: Ошибка, профиль не найден!')
            })
    }