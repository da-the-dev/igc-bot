const { Message, Client, MessageEmbed } = require('discord.js')
const axios = require('axios').default
const jsdom = require("jsdom")
const { db } = require('../utility')
const { DBUser } = db
const constants = require('../constants.json')
const { e } = constants


module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * @description Usage: .cwupdate
    */
    async (args, msg, client) => {
        const user = await new DBUser(msg.guild.id, msg.author.id)
        if(!user.cw) {
            msg.channel.send(`:warning: К участнику ${msg.author} не привязан профиль <@&${constants.roles.cw}>`)
            return
        }
        const link = `https://cod.tracker.gg/cold-war/profile/${user.cw.platform}/${user.cw.usertag.replace('#', '%23')}/detailed`
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

                const pKills = `\`${stats[41].children[1].textContent} (${stats[41].children[2].children[0].textContent})\``
                const pMatches = `\`${dom.window.document.getElementsByClassName('matches')[2].textContent.trim().replace(' Matches', '')}\``
                const pKD = `\`${stats[43].children[1].textContent} (${stats[43].children[2].children[0].textContent})\``
                const pDeaths = `\`${stats[42].children[1].textContent} (${stats[42].children[2].children[0].textContent})\``

                const embed = new MessageEmbed({
                    "title": "Обновление статистики ColdWar",
                    "description": `${e.info} [** ${user.cw.usertag}**](${link}) | ${msg.author}`,
                    "color": 7807101,
                    "fields": [
                        {
                            "name": "**Батл рояль**",
                            "value": `> ${e.lvl} Уровень: ${level}\n> ${e.prestige} Престиж: ${prestige}\n> ${e.kd} K/D: ${kd}\n> ${e.kills} Убийства: ${kills}\n> ${e.deaths} Смерти: ${deaths}\n> ${e.match} Матчей: ${matches}\n> ${e.top1} Победы: ${wins}\n> ${e.top5} Топ 5: ${top5}\n> ${e.top10} Топ 10: ${top10}\n> ${e.top25} Топ 25: ${top25}`,
                            "inline": true
                        },
                        {
                            "name": "**Добыча**",
                            "value": `> ${e.kills} Убийства: ${pKills}\n> ${e.match} Матчей: ${pMatches}\n> ${e.kd} K/D: ${pKD}\n> ${e.deaths} Смертей: ${pDeaths}`,
                            "inline": true
                        }
                    ]
                })
                    .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
                    .setFooter('Авторство бота snipertf2#6625', 'https://cdn.discordapp.com/avatars/315339158912761856/6dc8a2b8f4f20f84bc099e1dfda20d3f.webp')
                    .setImage('https://i.stack.imgur.com/Fzh0w.png')
                // .setThumbnail('https://media.discordapp.net/attachments/849266054051528725/849584645040635914/20210602_124545.jpg?width=1138&height=1138')
                msg.channel.send(embed)

                const kds = [
                    constants.roles.kd1,
                    constants.roles.kd2,
                    constants.roles.kd3,
                    constants.roles.kd4
                ]

                const numKD = Number(stats[22].children[1].textContent)
                if(numKD >= 1 && numKD < 2 && !msg.member.roles.cache.get(constants.roles.kd1)) {
                    msg.member.roles.remove(kds)
                    msg.member.roles.add(constants.roles.kd1)
                }
                if(numKD >= 2 && numKD < 3 && !msg.member.roles.cache.get(constants.roles.kd2)) {
                    msg.member.roles.remove(kds)
                    msg.member.roles.add(constants.roles.kd2)
                }
                if(numKD >= 3 && numKD < 4 && !msg.member.roles.cache.get(constants.roles.kd3)) {
                    msg.member.roles.remove(kds)
                    msg.member.roles.add(constants.roles.kd3)
                }
                if(numKD >= 4 && !msg.member.roles.cache.get(constants.roles.kd4)) {
                    msg.member.roles.remove(kds)
                    msg.member.roles.add(constants.roles.kd4)
                }

            })
            .catch(err => {
                console.log(err)
                if(err.response.status == '404')
                    msg.channel.send(':no_entry_sign: Ошибка, профиль не найден!')
            })
    }