const { Message, Client, MessageEmbed } = require('discord.js')
const axios = require('axios').default
const jsdom = require("jsdom")
const { db } = require('../utility')
const { DBUser } = db


module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * @description Usage: .wzupdate
    */
    async (args, msg, client) => {
        const user = await new DBUser(msg.guild.id, msg.author.id)
        if(!user.wz) {
            msg.channel.send(':no_entry_sign: Ошибка, профиль не зарегистрирован !')
            return
        }
        axios.get(`https://cod.tracker.gg/warzone/profile/battlenet/${user.wz.replace('#', '%23')}/detailed`)
            .then(response => {
                const websiteString = response.data
                const dom = new jsdom.JSDOM(websiteString)

                const stats = dom.window.document.getElementsByClassName('numbers')

                // for(i = 0; i < stats.length; i++)
                //     console.log(i, stats[i].children[0].textContent, stats[i].children[1].textContent)

                const level = `\`${dom.window.document.getElementsByClassName('highlighted-stat')[0].children[1].children[0].textContent.replace('Level ', '')}\``
                const prestige = `\`${dom.window.document.getElementsByClassName('highlighted-stat')[0].children[1].children[1].textContent.trim().replace('Prestige ', '')}\``
                const kd = `\`${stats[22].children[1].textContent}\``
                const kills = `\`${stats[20].children[1].textContent}\``
                const deaths = `\`${stats[21].children[1].textContent}\``
                const matches = `\`${dom.window.document.getElementsByClassName('matches')[1].textContent.trim().replace(' Matches', '')}\``
                const wins = `\`${stats[16].children[1].textContent}\``
                const top5 = `\`${stats[17].children[1].textContent}\``
                const top10 = `\`${stats[18].children[1].textContent}\``
                const top25 = `\`${stats[19].children[1].textContent}\``
                const ppm = `\`${stats[26].children[1].textContent}\``
                const winsPercent = `\`${stats[29].children[1].textContent}\``

                const pKills = `\`${stats[41].children[1].textContent}\``
                const pMatches = `\`${dom.window.document.getElementsByClassName('matches')[2].textContent.trim().replace(' Matches', '')}\``
                const pKD = `\`${stats[43].children[1].textContent}\``
                const pDeaths = `\`${stats[42].children[1].textContent}\``
                const pPpm = `\`${stats[47].children[1].textContent}\``

                const embed = new MessageEmbed({
                    "title": " Обновление статистики Warzone",
                    "description": `[** ${user.wz}**](https://cod.tracker.gg/warzone/profile/battlenet/${user.wz.replace('#', '%23')}/detailed) | ${msg.author}`,
                    "color": 7807101,
                    "fields": [
                        {
                            "name": "**Батл рояль**",
                            "value": `> Уровень: ${level}\n> Престиж: ${prestige}\n> K/D: ${kd}\n> Убийства: ${kills}\n> Смерти: ${deaths}\n> Матчей: ${matches}\n> Победы: ${wins}\n> Топ 5: ${top5}\n> Топ 10: ${top10}\n> Топ 25: ${top25}\n> Очки/мин: ${ppm}\n> Победы %: ${winsPercent}`,
                            "inline": true
                        },
                        {
                            "name": "**Добыча**",
                            "value": `> Убийства: ${pKills}\n> Матчей: ${pMatches}\n> K/D: ${pKD}\n> Смертей: ${pDeaths}\n> Очки/мин: ${pPpm}\n`,
                            "inline": true
                        }
                    ]
                })
                    .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
                    .setFooter('Авторство бота snipertf2#6625', 'https://cdn.discordapp.com/avatars/315339158912761856/6dc8a2b8f4f20f84bc099e1dfda20d3f.webp')
                msg.channel.send(embed)
            })
            .catch(err => {
                if(err.response.status == '404')
                    msg.channel.send(':no_entry_sign: Ошибка, профиль не найден!')
            })
    }