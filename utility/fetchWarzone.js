// const axios = require('axios').default

// axios.get('https://cod.tracker.gg/warzone/profile/battlenet/TheInviZ%232823/detailed', {
//     // headers: { 'TRN-Api-Key': 'ab864c3c-c593-4c86-b213-362c208ad4ee' }
// })
//     .then(response => {
//         const websiteString = response.data

//         const jsdom = require("jsdom");
//         const dom = new jsdom.JSDOM(websiteString);


//         // for(i = 0; i < 62; i++) {
//         //     console.log(i, dom.window.document.getElementsByClassName('value').item(i).textContent)
//         // }
//         const stats = dom.window.document.getElementsByClassName('numbers')

//         for(i = 0; i < stats.length; i++)
//             console.log(i, stats[i].children[0].textContent, stats[i].children[1].textContent)

//         // Level
//         console.log('Уровень:', dom.window.document.getElementsByClassName('highlighted-stat')[0].children[1].children[0].textContent)
//         // Prestige
//         console.log('Престиж:', dom.window.document.getElementsByClassName('highlighted-stat')[0].children[1].children[1].textContent.trim())
//         console.log('\nBattle Royal')

//         // Battle Royal
//         console.log('K/D:', stats[22].children[1].textContent)
//         console.log('Убийства:', stats[20].children[1].textContent)
//         console.log('Смерти:', stats[21].children[1].textContent)
//         console.log('Матчей:', dom.window.document.getElementsByClassName('matches')[1].textContent.trim().replace(' Matches', ''))
//         console.log('Победы', stats[16].children[1].textContent)
//         console.log('Топ 5', stats[17].children[1].textContent)
//         console.log('Топ 10', stats[18].children[1].textContent)
//         console.log('Топ 25', stats[19].children[1].textContent)

//         console.log('Очки/мин:', stats[26].children[1].textContent)
//         console.log('Победы %', stats[18].children[1].textContent)

//         // const kd = dom.window.document.getElementsByClassName('value').item(22).textContent

//         // console.log(website)
//         // const searchString = 'K/D Ratio</span> <!----> <span class="value" data-v-5edf1b22>'
//         // console.log(website.substr(website.lastIndexOf(searchString) + searchString.length, 4))
//     })
