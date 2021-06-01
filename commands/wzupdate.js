const Discord = require('discord.js')
const axios = require('axios').default
const jsdom = require("jsdom");

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Discord.Message} msg Discord message object
    * @param {Discord.Client} client Discord client object
    * @description Usage: .test
    */
    async (args, msg, client) => {
        const user = args[0]
        if(!user) return

        const response = await axios.get(`https://cod.tracker.gg/warzone/profile/battlenet/${user.replace('#', '%23')}/detailed`)
        const websiteString = response.data
        const dom = new jsdom.JSDOM(websiteString);

        const stats = dom.window.document.getElementsByClassName('numbers')

        // for(i = 0; i < stats.length; i++)
        //     console.log(i, stats[i].children[0].textContent, stats[i].children[1].textContent)

        const message = `
        Уровень: ${dom.window.document.getElementsByClassName('highlighted-stat')[0].children[1].children[0].textContent}
Престиж: ${dom.window.document.getElementsByClassName('highlighted-stat')[0].children[1].children[1].textContent.trim()}
K/D: ${stats[22].children[1].textContent}
Убийства: ${stats[20].children[1].textContent}
Смерти: ${stats[21].children[1].textContent}
Матчей: ${dom.window.document.getElementsByClassName('matches')[1].textContent.trim().replace(' Matches', '')}
Победы: ${stats[16].children[1].textContent}
Топ 5: ${stats[17].children[1].textContent}
Топ 10: ${stats[18].children[1].textContent}
Топ 25: ${stats[19].children[1].textContent}
Очки/мин: ${stats[26].children[1].textContent}
Победы %: ${stats[29].children[1].textContent}
        `

        msg.channel.send(message)
    }