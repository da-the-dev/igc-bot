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
    * @description Usage: .mwupdate
    */
    async (args, msg, client) => {
        const user = await new DBUser(msg.guild.id, msg.author.id)
        if(!user.mw) {
            msg.channel.send(`:warning: К участнику ${msg.author} не привязан профиль **Modern Warfare**`)
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

                var platform = ''
                switch(user.mw.platform) {
                    case "battlenet":
                        platform = 'Battle.net'
                        break
                    case 'atvi':
                        platform = 'Activision'
                        break
                }

                const embed = new MessageEmbed({
                    "title": "Обновление статистики Moden Warfare",
                    "description": `${e.info} Ник: ${msg.author} | ${platform}: [** ${user.mw.usertag}**](${link})`,
                    "color": 7807101,
                    "fields": [
                        {
                            "name": "**Общее**",
                            "value": `> ${e.lvl} Уровень: ${level}\n> ${e.prestige} Престиж: ${prestige}\n> ${e.kd} K/D: ${kd}\n> ${e.top1} Победы: ${wins}\n> ${e.kills} Убийства: ${kills}\n> ${e.deaths} Смерти: ${deaths}\n`
                        }
                    ]
                })
                    .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
                    .setFooter('support@imperialgameclub.ru\n©2020 - 2021 Imperial Game Club', 'https://cdn.discordapp.com/attachments/849266054051528725/849339869393977344/1622394419919.jpg')
                    .setImage('https://i.stack.imgur.com/Fzh0w.png')
                    .setThumbnail('https://cdn.discordapp.com/attachments/849340799392153650/850064247572136028/i_1.jpeg')
                msg.channel.send(embed)

                const mwkds = [
                    constants.roles.mwkd1,
                    constants.roles.mwkd2,
                    constants.roles.mwkd3,
                    constants.roles.mwkd4
                ]

                const numKD = Number(stats[0].children[1].textContent)
                if(numKD >= 1 && numKD < 2 && !msg.member.roles.cache.get(constants.roles.mwkd1)) {
                    msg.member.roles.remove(mwkds)
                    msg.member.roles.add(constants.roles.mwkd1)
                }
                if(numKD >= 2 && numKD < 3 && !msg.member.roles.cache.get(constants.roles.mwkd2)) {
                    msg.member.roles.remove(mwkds)
                    msg.member.roles.add(constants.roles.mwkd2)
                }
                if(numKD >= 3 && numKD < 4 && !msg.member.roles.cache.get(constants.roles.mwkd3)) {
                    msg.member.roles.remove(mwkds)
                    msg.member.roles.add(constants.roles.mwkd3)
                }
                if(numKD >= 4 && !msg.member.roles.cache.get(constants.roles.mwkd4)) {
                    msg.member.roles.remove(mwkds)
                    msg.member.roles.add(constants.roles.mwkd4)
                }

            })
            .catch(err => {
                console.log(err)
                if(err.response.status == '404')
                    msg.channel.send(':no_entry_sign: Ошибка, профиль не найден!')
            })
    }