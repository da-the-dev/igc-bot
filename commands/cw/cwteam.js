const { Message, Client } = require('discord.js')
const { embed } = require('../../utility')
const CWLobby = require('../../classes/lobbies/CWLobby')

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * @description Usage: .cwteam <?kd>
    */
    async (args, msg, client) => {
        const kd = Number(args[0])
        if(!CWLobby.kdCheck(args[0])) {
            embed.error(msg, 'KD должно быть целое число от 1 до 4!')
            return
        }

        CWLobby.create(msg, kd, args[1])
    }