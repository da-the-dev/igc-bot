const { Message } = require('discord.js')
const { db } = require('../utility')
const { DBUser, getConnection } = db
const axios = require('axios').default
const constants = require('../constants.json')
const platforms = 'Поддерживаемые платформы:\n\nº**BattleNet** *(пиши в команде `battle` в параметре платформы)*\nº**Activision** *(пиши в команде `activ` в параметре платформы)*\nº**Playstation** *(пиши в команде `ps` в параметре платформы)*\nº**Xbox** *(пиши в команде `xbox` в параметре платформы)*'

/**
 * Register user game profile in database
 * @param {Message} msg
 * @param {string[]} args 
 * @param {'warzone'|'modern-warfare'|'cold-war'} game 
 */
module.exports.reg =
    async (msg, args, game) => {
        const prettyName = game != 'warzone' ? game.replace('-', ' ').split(' ').map(e => e = e[0].toUpperCase() + e.slice(1)).join(' ') : 'Warzone'
        const code = game != 'warzone' ? game.replace('-', ' ').split(' ').map(e => e = e[0].toLowerCase()).join('') : 'wz'

        // console.log(prettyName, code, constants.roles[code])

        var linkRemainder = ''
        switch(game) {
            case 'warzone':
                linkRemainder = 'detailed'
                break
            case 'modern-warfare':
                linkRemainder = 'mp'
                break
            case 'cold-war':
                linkRemainder = 'mp'
                break
        }

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

        const susUser = await getConnection().qget(msg.guild.id, { [`${code}.usertag`]: usertag })
        if(susUser) {
            msg.channel.send(`:warning: Профиль **${prettyName}** ${usertag} уже закреплен за <@${susUser.id}>`)
            return
        }

        var link = ''
        var linkPlatform = ''
        switch(platform) {
            case 'battle':
                link = `https://cod.tracker.gg/${game}/profile/battlenet/${usertag.replace('#', '%23')}/${linkRemainder}`
                linkPlatform = 'battlenet'
                break
            case 'activ':
                link = `https://cod.tracker.gg/${game}/profile/atvi/${usertag.replace('#', '%23')}/${linkRemainder}`
                linkPlatform = 'atvi'
                break
            case 'ps':
                link = `https://cod.tracker.gg/${game}/profile/psn/${usertag.replace('#', '%23')}/${linkRemainder}`
                linkPlatform = 'psn'
                break
            case 'xbox':
                link = `https://cod.tracker.gg/${game}/profile/xbl/${usertag.replace('#', '%23')}/${linkRemainder}`
                linkPlatform = 'xbl'
                break
            default:
                msg.channel.send(':no_entry_sign: Ошибка, указана неверная платформа !\n' + platforms)
                return
        }

        console.log('here')
        console.log(`https://cod.tracker.gg/${game}/profile/${linkPlatform}/${usertag.replace('#', '%23')}/${linkRemainder}`)
        axios.get(`https://cod.tracker.gg/${game}/profile/${linkPlatform}/${usertag.replace('#', '%23')}/${linkRemainder}`)
            .then(async response => {
                console.log('all good')
                if(!msg.member.roles.cache.get(constants.roles[code]))
                    msg.member.roles.add(constants.roles[code])

                const user = await new DBUser(msg.guild.id, msg.author.id)
                user[code] = { usertag: usertag, platform: linkPlatform }
                await user.save()
                msg.channel.send(`:white_check_mark: ${msg.author}, Ваш профиль **${prettyName}** успешно закреплен | ${usertag}`)
            })
            .catch(err => {
                if(err.response.status == '404')
                    msg.channel.send(':no_entry_sign: Ошибка, профиль не найден!')
                else
                    msg.channel.send(`:no_entry_sign: Ошибка ${err.response.status}: \`${err.response.statusMessage}\`. Возможно, ошибка на стороне провайдера информации, попробуйте позже !`)
            })
    }

/**
 * 
 * @param {Message} msg 
 * @param {'warzone'|'modern-warfare'|'cold-war'} game
 */
module.exports.clear =
    async (msg, game) => {
        const prettyName = game != 'warzone' ? game.replace('-', ' ').split(' ').map(e => e = e[0].toUpperCase() + e.slice(1)).join(' ') : 'Warzone'
        const code = game != 'warzone' ? game.replace('-', ' ').split(' ').map(e => e = e[0].toLowerCase()).join('') : 'wz'

        const user = await new DBUser(msg.guild.id, msg.author.id)
        delete user[code]
        user.save()
        msg.channel.send(`:white_check_mark: ${msg.author}, Ваш профиль **${prettyName}** успешно откреплен`)
    }
