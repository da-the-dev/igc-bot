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
            msg.channel.send(`:warning: К участнику ${msg.author} не привязан профиль **Cold War**`)
            return
        }
        const link = `https://cod.tracker.gg/cold-war/profile/${user.cw.platform}/${user.cw.usertag.replace('#', '%23')}/mp`
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

                var platform = ''
                switch(user.wz.platform) {
                    case "battlenet":
                        platform = 'Battle.net'
                        break
                    case 'atvi':
                        platform = 'Activision'
                        break
                }

                const embed = new MessageEmbed({
                    "title": "Обновление статистики Cold War",
                    "description": `${e.info} Ник: ${msg.author} | ${platform}: [** ${user.cw.usertag}**](${link})`,
                    "color": 7807101,
                    "fields": [
                        {
                            "name": "**Общее**",
                            "value": `> ${e.lvl} Уровень: ${level}\n> ${e.prestige} Престиж: ${prestige}\n> ${e.kd} K/D: ${kd}\n> ${e.top1} Победы: ${wins}\n> ${e.kills} Убийства: ${kills}\n> ${e.deaths} Смерти: ${deaths}\n`
                        }
                    ]
                })
                    .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
                    .setFooter('Авторство бота snipertf2#6625', 'https://cdn.discordapp.com/avatars/315339158912761856/6dc8a2b8f4f20f84bc099e1dfda20d3f.webp')
                    .setImage('https://i.stack.imgur.com/Fzh0w.png')
                // .setThumbnail('https://media.discordapp.net/attachments/849266054051528725/849584645040635914/20210602_124545.jpg?width=1138&height=1138')
                msg.channel.send(embed)

                const cwkds = [
                    constants.roles.cwkd1,
                    constants.roles.cwkd2,
                    constants.roles.cwkd3,
                    constants.roles.cwkd4
                ]

                const numKD = Number(stats[0].children[1].textContent)
                if(numKD >= 1 && numKD < 2 && !msg.member.roles.cache.get(constants.roles.cwkd1)) {
                    msg.member.roles.remove(cwkds)
                    msg.member.roles.add(constants.roles.cwkd1)
                }
                if(numKD >= 2 && numKD < 3 && !msg.member.roles.cache.get(constants.roles.cwkd2)) {
                    msg.member.roles.remove(cwkds)
                    msg.member.roles.add(constants.roles.cwkd2)
                }
                if(numKD >= 3 && numKD < 4 && !msg.member.roles.cache.get(constants.roles.cwkd3)) {
                    msg.member.roles.remove(cwkds)
                    msg.member.roles.add(constants.roles.cwkd3)
                }
                if(numKD >= 4 && !msg.member.roles.cache.get(constants.roles.cwkd4)) {
                    msg.member.roles.remove(cwkds)
                    msg.member.roles.add(constants.roles.cwkd4)
                }

            })
            .catch(err => {
                console.log(err)
                if(err.response.status == '404')
                    msg.channel.send(':no_entry_sign: Ошибка, профиль не найден!')
            })
    }