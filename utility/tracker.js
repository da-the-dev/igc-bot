const { Message, MessageEmbed, GuildMember } = require('discord.js')
const { db } = require('../utility')
const { DBUser, getConnection } = db
const axios = require('axios').default
const constants = require('../constants.json')
const { e } = constants
const platforms = 'Поддерживаемые платформы:\n\nº**BattleNet** *(пиши в команде `battle` в параметре платформы)*\nº**Activision** *(пиши в команде `activ` в параметре платформы)*\nº**Playstation** *(пиши в команде `ps` в параметре платформы)*\nº**Xbox** *(пиши в команде `xbox` в параметре платформы)*'

/**
 * Returns game's pretty name and code
 * @param {'warzone'|'modern-warfare'|'cold-war'} game
 * @returns
 */
const gameDecoder = game => {
    const prettyName = game != 'warzone' ? game.replace('-', ' ').split(' ').map(e => e = e[0].toUpperCase() + e.slice(1)).join(' ') : 'Warzone'
    const code = game != 'warzone' ? game.replace('-', ' ').split(' ').map(e => e = e[0].toLowerCase()).join('') : 'wz'

    return { prettyName: prettyName, code: code }
}

module.exports.finder = (stats, name) => {
    var counter = 1
    const arr = Array.from(stats)
    for(let i = 0; i < arr.length; i++) {
        // console.log(i, arr[i].children[0].textContent, arr[i].children[0].textContent == name)
        if(arr[i].children[0].textContent == name && counter != 2)
            counter++
        else if(arr[i].children[0].textContent == name && counter == 2)
            return i
    }
}

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

        axios.get(`https://cod.tracker.gg/${game}/profile/${linkPlatform}/${usertag.replace('#', '%23')}/${linkRemainder}`)
            .then(async response => {
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

/**
 * Register user game profile in database
 * @param {Message} msg
 * @param {'warzone'|'modern-warfare'|'cold-war'} game
 * @param {DBUser} user
 * @param {string} link
 */
module.exports.presetEmbed = (msg, game, user, link) => {
    const dg = gameDecoder(game)

    // Selecting platform
    var platform = ''
    switch(user[dg.code].platform) {
        case "battle":
            platform = 'Battle.net'
            break
        case 'atvi':
            platform = 'Activision'
            break
        case 'ps':
            platform = 'PlayStation'
            break
        case 'xbox':
            platform = 'Xbox'
            break
    }

    // Selecting thumbnail
    var thumb = ''
    switch(game) {
        case 'warzone':
            thumb = 'https://media.discordapp.net/attachments/849266054051528725/849584645040635914/20210602_124545.jpg?width=1138&height=1138'
            break
        case 'modern-warfare':
            thumb = 'https://cdn.discordapp.com/attachments/849340799392153650/850064247572136028/i_1.jpeg'
            break
        case 'cold-war':
            thumb = 'https://cdn.discordapp.com/attachments/849340799392153650/850064247366877224/i.jpeg'
            break
    }

    // Cooking an embed
    return new MessageEmbed({
        "title": `Обновление статистики ${dg.prettyName}`,
        "description": `${e.info} Ник: ${msg.author} | ${platform}: [** ${user[dg.code].usertag}**](${link})`,
        "color": 7807101
    })
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
        .setFooter('support@imperialgameclub.ru\n©2020 - 2021 Imperial Game Club', msg.client.user.displayAvatarURL({ dynamic: true }))
        .setImage('https://i.stack.imgur.com/Fzh0w.png')
        .setThumbnail(thumb)
}

/**
 * Give K/D roles for users
 * @param {'warzone'|'modern-warfare'|'cold-war'} game
 * @param {GuildMember} member
 * @param {number} kd
 */
module.exports.kdRoles = (game, member, kd) => {
    var kdRoles = []
    switch(game) {
        case 'warzone':
            kdRoles = [constants.roles.wzkd1, constants.roles.wzkd2, constants.roles.wzkd3, constants.roles.wzkd4]
            break
        case 'modern-warfare':
            kdRoles = [constants.roles.mwkd1, constants.roles.mwkd2, constants.roles.mwkd3, constants.roles.mwkd4]
            break
        case 'warzone':
            kdRoles = [constants.roles.cwkd1, constants.roles.cwkd2, constants.roles.cwkd3, constants.roles.cwkd4]
            break
    }


    if(kd < 2 && !member.roles.cache.get(kdRoles[0])) {
        member.roles.remove(kdRoles)
        member.roles.add(kdRoles[0])
    }
    if(kd >= 2 && kd < 3 && !member.roles.cache.get(kdRoles[1])) {
        member.roles.remove(kdRoles)
        member.roles.add(kdRoles[1])
    }
    if(kd >= 3 && kd < 4 && !member.roles.cache.get(kdRoles[2])) {
        member.roles.remove(kdRoles)
        member.roles.add(kdRoles[2])
    }
    if(kd >= 4 && !member.roles.cache.get(kdRoles[3])) {
        member.roles.remove(kdRoles)
        member.roles.add(kdRoles[3])
    }
}

module.exports.profileErrors = err => {
    console.log(err)
    if(err.response && err.response.status == '404')
        msg.channel.send(':no_entry_sign: Ошибка, профиль не найден!')
}