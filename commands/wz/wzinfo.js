const { Message, Client, GuildMember } = require('discord.js')
const axios = require('axios').default
const jsdom = require('jsdom')
const { db, tracker, embed } = require('../../utility')
const { DBUser } = db
const constants = require('../../constants.json')
const { e } = constants

/**
 * Get user info
 *
 * @param {GuildMember} member
 * @param {Message} msg
 */
const getUserInfo = async (member, msg) => {
    const user = await new DBUser(member.guild.id, member.id)
    if(!user.wz) {
        embed.warning(msg, `К участнику ${member} не привязан профиль **Warzone**`)
        return
    }
    const link = `https://cod.tracker.gg/warzone/profile/${user.wz.platform}/${user.wz.usertag.replace('#', '%23')}/detailed`
    axios.get(link)
        .then(response => {
            const websiteString = response.data
            const dom = new jsdom.JSDOM(websiteString)

            const stats = dom.window.document.getElementsByClassName('main')

            var battle, battleString, plunder, plunderString
            try {
                battle = Array.from(stats[1].children).map(el => el.children[0].children[1]).map(el => el.children).map(el => [el[0].textContent, el[1].textContent, el[2].children[0].textContent])
                battleString =
                    `> ${e.lvl} Уровень: \`${dom.window.document.getElementsByClassName('highlighted-stat')[0].children[1].children[0].textContent.replace('Level ', '')}\`\n` +
                    `> ${e.prestige} Престиж: \`${dom.window.document.getElementsByClassName('highlighted-stat')[0].children[1].children[1].textContent.trim().replace('Prestige ', '')}\`\n` +
                    `> ${e.kd} K/D: \`${battle[6][1]} (${battle[6][2]})\`\n` +
                    `> ${e.kills} Убийства: \`${battle[4][1]} (${battle[4][2]})\`\n` +
                    `> ${e.kills} Смерти: \`${battle[5][1]} (${battle[5][2]})\`\n` +
                    `> ${e.match} Матчей: \`${dom.window.document.getElementsByClassName('matches')[1].textContent.trim().replace(' Matches', '')}\`\n` +
                    `> ${e.kills} Победы: \`${battle[0][1]} (${battle[0][2]})\`\n` +
                    `> ${e.kills} Топ 5: \`${battle[1][1]} (${battle[1][2]})\`\n` +
                    `> ${e.kills} Топ 10: \`${battle[2][1]} (${battle[2][2]})\`\n` +
                    `> ${e.kills} Топ 25: \`${battle[3][1]} (${battle[3][2]})\`\n`
            } catch(err) { console.log('No battle data!') }

            try {
                plunder = Array.from(stats[2].children).map(el => el.children[0].children[1]).map(el => el.children).map(el => [el[0].textContent, el[1].textContent, el[2].children[0].textContent])
                plunderString =
                    `> ${e.kills} Убийства: \`${plunder[1][1]} (${plunder[1][2]})\`\n` +
                    `> ${e.match} Матчей: \`${dom.window.document.getElementsByClassName('matches')[2].textContent.trim().replace(' Matches', '')}\`\n` +
                    `> ${e.kd} K/D: \`${plunder[3][1]} (${plunder[3][2]})\`\n` +
                    `> ${e.deaths} Смертей: \`${plunder[2][1]} (${plunder[2][2]})\`\n` +
                    `> ${e.top1} Победы %: \`${plunder[11][1]} (${plunder[11][2]})\``
            } catch(err) { console.log('No plunder data!') }
            // console.log(battle)
            // console.log()
            // console.log(plunder)

            //@ts-ignore
            const emb = tracker.presetEmbed(member, 'warzone', user, link)


            if(battle) emb.addField('**Батл рояль**', battleString, true)
            if(plunder) emb.addField('**Добыча**', plunderString, true)

            if(emb.fields.length <= 0)
                embed.warning(msg, 'Не найдена никакая статистика по игроку!')
            else {
                msg.channel.send(emb)
                return
            }

            const numKD = Number(battle[6][1])
            tracker.kdRoles('warzone', member, numKD)

            const wzks = [
                constants.roles.wz5000ks,
                constants.roles.wz10000ks,
                constants.roles.wz20000ks
            ]
            const numKills = Number(battle[4][1])
            if(numKills >= 5000 && numKills < 10000 && !member.roles.cache.get(constants.roles.wz5000ks)) {
                member.roles.remove(wzks)
                member.roles.add(constants.roles.wz5000ks)
            }
            if(numKills >= 10000 && numKills < 20000 && !member.roles.cache.get(constants.roles.wz10000ks)) {
                member.roles.remove(wzks)
                member.roles.add(constants.roles.wz10000ks)
            }
            if(numKills >= 20000 && !member.roles.cache.get(constants.roles.wz5000ks)) {
                member.roles.remove(wzks)
                member.roles.add(constants.roles.wz20000ks)
            }
        })
        .catch(err => {
            tracker.profileErrors(msg, err)
        })

}

module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Message} msg Discord message object
     * @param {Client} client Discord client object
     * @description Usage: .wzinfo
     */
    async (args, msg, client) => {
        const mMember = msg.mentions.members.first()
        if(mMember)
            getUserInfo(mMember, msg)
        else
            getUserInfo(msg.member, msg)

    }