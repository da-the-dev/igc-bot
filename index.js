// Libraries
require('dotenv').config()
const Discord = require('discord.js')
const fs = require('fs')
const utl = require('./utility')

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

process.stdin.resume();
function exitHandler(options, exitCode) {
    if(options.cleanup) {
        utl.connections.closeConnections(); console.log('ded')
    }
    if(exitCode || exitCode === 0) console.log(exitCode);
    if(options.exit) process.exit();
}
process.on('exit', exitHandler.bind(null, { cleanup: true }));
process.on('res', exitHandler.bind(null, { cleanup: true }));
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));


client.login(process.env.BOTTOKEN)
client.once('ready', async () => {
    await utl.connections.startconnections(3)
    console.log("[BOT] BOT is online")
})
// client.on('presenceUpdate', (oldPresence, newPresence) => {
//     if(!newPresence.activities) return false;
//     newPresence.activities.forEach(activity => {
//         if(activity.type == "STREAMING") {
//             console.log(`${newPresence.user.tag} is streaming at ${activity.url}.`);
//         };
//     });
// })
client.on('message', msg => {
    // Bot commands
    if(!msg.author.bot) {
        if(msg.content[0] == prefix) {
            var args = msg.content.slice(1).split(" ")
            args.forEach(a => a.trim())
            const command = args.shift()

            console.log('test')

            const execCommand = client.commands.find(c => c.name == command)
            if(execCommand) execCommand.foo(args, msg, client); console.log('command')
        }
    }
})