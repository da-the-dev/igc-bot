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
    if(!user.mw) {
        embed.warning(msg, `К участнику ${member} не привязан профиль **Modern Warfare**`)
        return
    }
    const link = `https://cod.tracker.gg/modern-warfare/profile/${user.mw.platform}/${user.mw.usertag.replace('#', '%23')}/mp`
    axios.get(link)
        .then(response => {
            const websiteString = response.data
            const dom = new jsdom.JSDOM(websiteString)

            const stats = dom.window.document.getElementsByClassName('numbers')

            // for(i = 0; i < stats.length; i++)
            //     console.log(i, stats[i].children[0].textContent, stats[i].children[1].textContent)

            const level = `\`${dom.window.document.getElementsByClassName('highlighted-stat')[0].children[1].children[0].textContent.replace('Level ', '')}\``
            const prestige = `\`${dom.window.document.getElementsByClassName('highlighted-stat')[0].children[1].children[1].textContent.trim().replace('Prestige ', '')}\``
            const kd = `\`${stats[0].children[1].textContent} (${stats[0].children[2].children[0].textContent})\``
            const wins = `\`${stats[2].children[1].textContent} (${stats[2].children[2].children[0].textContent})\``
            const kills = `\`${stats[1].children[1].textContent} (${stats[1].children[2].children[0].textContent})\``
            const deaths = `\`${stats[8].children[1].textContent} (${stats[8].children[2].children[0].textContent})\``

            msg.channel.send(
                tracker.presetEmbed(member, 'modern-warfare', user, link)
                    .addFields(
                        [
                            {
                                'name': '**Общее**',
                                'value': `> ${e.lvl} Уровень: ${level}\n> ${e.prestige} Престиж: ${prestige}\n> ${e.kd} K/D: ${kd}\n> ${e.top1} Победы: ${wins}\n> ${e.kills} Убийства: ${kills}\n> ${e.deaths} Смерти: ${deaths}\n`
                            }
                        ]
                    )
            )

            const numKD = Number(stats[0].children[1].textContent)
            tracker.kdRoles('modern-warfare', member, numKD)
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
     * @description Usage: .mwinfo
     */
    async (args, msg, client) => {
        const mMember = msg.mentions.members.first()
        if(mMember)
            getUserInfo(mMember, msg)
        else
            getUserInfo(msg.member, msg)
    }