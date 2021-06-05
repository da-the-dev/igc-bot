const { Message, Client, MessageEmbed } = require('discord.js')
const axios = require('axios').default
const jsdom = require("jsdom")
const { db, tracker } = require('../utility')
const { DBUser } = db
const constants = require('../constants.json')
const { e } = constants

/**
 * Get user info
 * @param {GuildMember} member
 */
const getUserInfo = async (member, msg) => {
    const user = await new DBUser(member.guild.id, member.id)
    if(!user.wz) {
        msg.channel.send(`:warning: К участнику ${member} не привязан профиль **Warzone**`)
        return
    }
    const link = `https://cod.tracker.gg/warzone/profile/${user.wz.platform}/${user.wz.usertag.replace('#', '%23')}/detailed`
    axios.get(link)
        .then(response => {
            const websiteString = response.data
            const dom = new jsdom.JSDOM(websiteString)

            const stats = dom.window.document.getElementsByClassName('numbers')

            // for(i = 0; i < stats.length; i++)
            //     console.log(i, stats[i].children[0].textContent, stats[i].children[1].textContent)
            // console.log(i, stats[18].children[1].textContent, stats[18].children[2].children[0].textContent)

            const level = `\`${dom.window.document.getElementsByClassName('highlighted-stat')[0].children[1].children[0].textContent.replace('Level ', '')}\``
            const prestige = `\`${dom.window.document.getElementsByClassName('highlighted-stat')[0].children[1].children[1].textContent.trim().replace('Prestige ', '')}\``

            const kd = `\`${stats[22].children[1].textContent} (${stats[22].children[2].children[0].textContent})\``
            const kills = `\`${stats[20].children[1].textContent} (${stats[20].children[2].children[0].textContent})\``
            const deaths = `\`${stats[21].children[1].textContent} (${stats[21].children[2].children[0].textContent})\``
            const matches = `\`${dom.window.document.getElementsByClassName('matches')[1].textContent.trim().replace(' Matches', '')}\``
            const wins = `\`${stats[16].children[1].textContent} (${stats[16].children[2].children[0].textContent})\``
            const top5 = `\`${stats[17].children[1].textContent} (${stats[17].children[2].children[0].textContent})\``
            const top10 = `\`${stats[18].children[1].textContent} (${stats[18].children[2].children[0].textContent})\``
            const top25 = `\`${stats[19].children[1].textContent} (${stats[19].children[2].children[0].textContent})\``

            const pKillsPos = tracker.finder(stats, 'Kills')
            const pKills = `\`${stats[pKillsPos].children[1].textContent} (${stats[pKillsPos].children[2].children[0].textContent})\``
            const pMatches = `\`${dom.window.document.getElementsByClassName('matches')[2].textContent.trim().replace(' Matches', '')}\``
            const pKDPos = tracker.finder(stats, 'K/D Ratio')
            const pKD = `\`${stats[pKDPos].children[1].textContent} (${stats[pKDPos].children[2].children[0].textContent})\``
            const pDeathsPos = tracker.finder(stats, 'Deaths')
            const pDeaths = `\`${stats[pDeathsPos].children[1].textContent} (${stats[pDeathsPos].children[2].children[0].textContent})\``
            const pWinsPcentPos = tracker.finder(stats, 'Win %')
            const pWinsPcent = `\`${stats[pWinsPcentPos].children[1].textContent} (${stats[pWinsPcentPos].children[2].children[0].textContent})\``

            msg.channel.send(
                tracker.presetEmbed(member, 'warzone', user, link)
                    .addFields([
                        {
                            "name": "**Батл рояль**",
                            "value": `> ${e.lvl} Уровень: ${level}\n> ${e.prestige} Престиж: ${prestige}\n> ${e.kd} K/D: ${kd}\n> ${e.kills} Убийства: ${kills}\n> ${e.deaths} Смерти: ${deaths}\n> ${e.match} Матчей: ${matches}\n> ${e.top1} Победы: ${wins}\n> ${e.top5} Топ 5: ${top5}\n> ${e.top10} Топ 10: ${top10}\n> ${e.top25} Топ 25: ${top25}`,
                            "inline": true
                        },
                        {
                            "name": "**Добыча**",
                            "value": `> ${e.kills} Убийства: ${pKills}\n> ${e.match} Матчей: ${pMatches}\n> ${e.kd} K/D: ${pKD}\n> ${e.deaths} Смертей: ${pDeaths}\n> ${e.top1} Победы %: ${pWinsPcent}`,
                            "inline": true
                        }
                    ])
            )

            const numKD = Number(stats[22].children[1].textContent)
            tracker.kdRoles('warzone', member, numKD)

            const wzks = [
                constants.roles.wz5000ks,
                constants.roles.wz10000ks,
                constants.roles.wz20000ks
            ]
            const numKills = Number(stats[20].children[1].textContent.replace(',', ''))
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
            tracker.profileErrors(err)
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