const { Message, MessageEmbed, GuildMember } = require('discord.js')
const { db, embed } = require('../utility')
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

/**
 * Returns game's link remainder
 * @param {'warzone'|'modern-warfare'|'cold-war'} game
 * @returns
 */
const linkRemainder = game => {
    switch(game) {
        case 'warzone':
            return 'detailed'
        case 'modern-warfare':
            return 'mp'
        case 'cold-war':
            return 'mp'
    }
}
module.exports.linkRemainder = linkRemainder

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

        const usertag = args[0]
        if(!usertag) {
            embed.error(msg, 'Ошибка, не указано имя пользователя!')
            return
        }
        const platform = args[1]
        if(!platform) {
            embed.error(msg, 'Ошибка, не указана платформа!\n' + platforms)
            return
        }

        const susUser = await getConnection().qget(msg.guild.id, { [`${code}.usertag`]: usertag })
        if(susUser) {
            embed.warning(msg, `Профиль **${prettyName}** ${usertag} уже закреплен за <@${susUser.id}>`)
            return
        }

        var link = ''
        var linkPlatform = ''
        switch(platform) {
            case 'battle':
                link = `https://cod.tracker.gg/${game}/profile/battlenet/${usertag.replace('#', '%23')}/${linkRemainder(game)}`
                linkPlatform = 'battlenet'
                break
            case 'activ':
                link = `https://cod.tracker.gg/${game}/profile/atvi/${usertag.replace('#', '%23')}/${linkRemainder(game)}`
                linkPlatform = 'atvi'
                break
            case 'ps':
                link = `https://cod.tracker.gg/${game}/profile/psn/${usertag.replace('#', '%23')}/${linkRemainder(game)}`
                linkPlatform = 'psn'
                break
            case 'xbox':
                link = `https://cod.tracker.gg/${game}/profile/xbl/${usertag.replace('#', '%23')}/${linkRemainder(game)}`
                linkPlatform = 'xbl'
                break
            default:
                embed.error(msg, 'Ошибка, указана неверная платформа!\n' + platforms)
                return
        }

        axios.get(`https://cod.tracker.gg/${game}/profile/${linkPlatform}/${usertag.replace('#', '%23')}/${linkRemainder}`)
            .then(async response => {
                if(!msg.member.roles.cache.get(constants.roles[code]))
                    msg.member.roles.add(constants.roles[code])

                const user = await new DBUser(msg.guild.id, msg.author.id)
                user[code] = { usertag: usertag, platform: linkPlatform }
                await user.save()

                embed.ok(msg, `${msg.author}, Ваш профиль **${prettyName}** успешно закреплен | ${usertag}`)
            })
            .catch(err => {
                if(err.response && err.response.status == '404')
                    embed.error(msg, 'Ошибка, профиль не найден!')
                else
                    console.log(err)
                // msg.channel.send(`Ошибка ${err}: \`${err.response.statusMessage}\`. Возможно, ошибка на стороне провайдера информации, попробуйте позже!`)
            })
    }

/**
 * 
 * @param {Message} msg 
 * @param {'warzone'|'modern-warfare'|'cold-war'} game
 */
module.exports.clear = async (msg, game) => {
    const prettyName = game != 'warzone' ? game.replace('-', ' ').split(' ').map(e => e = e[0].toUpperCase() + e.slice(1)).join(' ') : 'Warzone'
    const code = game != 'warzone' ? game.replace('-', ' ').split(' ').map(e => e = e[0].toLowerCase()).join('') : 'wz'

    const user = await new DBUser(msg.guild.id, msg.author.id)
    delete user[code]
    user.save()

    resetRoles(game, msg.member)

    embed.ok(msg, `${msg.author}, Ваш профиль **${prettyName}** успешно откреплен`)
}

/**
 * Register user game profile in database
 * @param {GuildMember} member
 * @param {'warzone'|'modern-warfare'|'cold-war'} game
 * @param {DBUser} user
 * @param {string} link
 */
module.exports.presetEmbed = (member, game, user, link) => {
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
        "description": `${e.info} Ник: ${member.user} | ${platform}: [** ${user[dg.code].usertag}**](${link})`,
        "color": 9109759
    })
        .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
        .setFooter('support@imperialgameclub.ru\n©2020 - 2021 Imperial Game Club', member.client.user.displayAvatarURL({ dynamic: true }))
        .setImage('https://i.stack.imgur.com/Fzh0w.png')
        .setThumbnail(thumb)
}

/**
 * Give K/D roles for users
 * @param {'warzone'|'modern-warfare'|'cold-war'} game
 * @param {GuildMember} member
 * @param {number} kd
 */
module.exports.kdRoles = async (game, member, kd) => {
    var kdRoles = []
    switch(game) {
        case 'warzone':
            kdRoles = [constants.roles.wzkd1, constants.roles.wzkd2, constants.roles.wzkd3, constants.roles.wzkd4]
            break
        case 'modern-warfare':
            kdRoles = [constants.roles.mwkd1, constants.roles.mwkd2, constants.roles.mwkd3, constants.roles.mwkd4]
            break
        case 'cold-war':
            kdRoles = [constants.roles.cwkd1, constants.roles.cwkd2, constants.roles.cwkd3, constants.roles.cwkd4]
            break
    }



    if(kd < 2 && !member.roles.cache.get(kdRoles[0])) {
        await member.roles.remove(kdRoles)
        await member.roles.add(kdRoles[0])
    }
    if(kd >= 2 && kd < 3 && !member.roles.cache.get(kdRoles[1])) {
        await member.roles.remove(kdRoles)
        await member.roles.add(kdRoles[1])
    }
    if(kd >= 3 && kd < 4 && !member.roles.cache.get(kdRoles[2])) {
        await member.roles.remove(kdRoles)
        await member.roles.add(kdRoles[2])
    }
    if(kd >= 4 && !member.roles.cache.get(kdRoles[3])) {
        await member.roles.remove(kdRoles)
        await member.roles.add(kdRoles[3])
    }
}

/**
 * Take game roles from user
 * @param {'warzone'|'modern-warfare'|'cold-war'} game
 * @param {GuildMember} member
 */
const resetRoles = async (game, member) => {
    var roles2remove = []
    var kdRoles = []
    switch(game) {
        case 'warzone':
            kdRoles = [constants.roles.wzkd1, constants.roles.wzkd2, constants.roles.wzkd3, constants.roles.wzkd4]
            break
        case 'modern-warfare':
            kdRoles = [constants.roles.mwkd1, constants.roles.mwkd2, constants.roles.mwkd3, constants.roles.mwkd4]
            break
        case 'cold-war':
            kdRoles = [constants.roles.cwkd1, constants.roles.cwkd2, constants.roles.cwkd3, constants.roles.cwkd4]
            break
    }

    roles2remove = roles2remove.concat(kdRoles) // Remove K/D roles
    roles2remove.push(constants.roles[gameDecoder(game).code]) // Remove game role
    if(game == 'warzone') // Remove kill-related roles
        roles2remove = roles2remove.concat([constants.roles.wz5000ks, constants.roles.wz10000ks, constants.roles.wz20000ks])

    // Actually remove all roles
    await member.roles.remove(roles2remove)
}


module.exports.profileErrors = (err, msg) => {
    console.log(err)
    if(err.response && err.response.status == '404')
        embed.error(msg, 'Ошибка, профиль не найден!')
}