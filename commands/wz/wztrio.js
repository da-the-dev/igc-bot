const { Message, Client } = require('discord.js')
const { embed } = require('../../utility')
const WZLobby = require('../../classes/lobbies/WZLobby')

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * @description Usage: .wztrio <?kd>
    */
    async (args, msg, client) => {
        const kd = Number(args[0])
        if(!WZLobby.kdCheck(args[0])) {
            embed.error(msg, 'KD должно быть целое число от 1 до 4!')
            return
        }

        WZLobby.create(msg, 3, kd, args[1])
    }