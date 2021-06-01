// Libraries
const Discord = require('discord.js')
const fs = require('fs')
require('dotenv').config()

// Client
const prefix = "!"
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
client.prefix = prefix

// Commands
/**
 * 
 * @param {string} dir 
 * @returns {string[]}
 */
function walk(dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if(stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(walk(file));
        } else {
            /* Is a file */
            results.push(file);
        }
    });
    return results;
}

var commandNames = walk('./commands').filter(c => c.endsWith('.js') && !c.includes('utility.js'))
client.commands = new Array()
console.log('[F] Bot functions')
commandNames.forEach(c => {
    client.commands.push({
        'name': c.slice(c.lastIndexOf('/') + 1, c.length - 3),
        'foo': require(c),
        'allowedInGeneral': require(c).allowedInGeneral
    })
    console.log(
        `[F] Name: ${c.slice(c.lastIndexOf('/') + 1, c.length - 3)}; 'allowedInGeneral': ${require(c).allowedInGeneral}`
    )
})

// General events
client.login(process.env.BOTTOKEN)
client.once('ready', async () => {
    console.log("[BOT] BOT is online")
})


client.on('message', msg => {
    // Bot commands
    if(!msg.author.bot) {
        console.log(prefix)
        if(msg.content[0] == prefix) {
            var args = msg.content.slice(1).split(" ")
            args.forEach(a => a.trim())
            const command = args.shift()
            console.log('here')

            const execCommand = client.commands.find(c => c.name == command)
            if(execCommand) execCommand.foo(args, msg, client)
        }
    }
})