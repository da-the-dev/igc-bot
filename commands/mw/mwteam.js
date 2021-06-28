const { Message, Client } = require('discord.js')
const { embed } = require('../../utility')
const MWLobby = require('../../classes/lobbies/MWLobby')

module.exports =
    /**
     * @param {Array<string>} args Command argument
     * @param {Message} msg Discord message object
     * @param {Client} client Discord client object
     * @description Usage: .mwteam <?kd>
     */
    async (args, msg, client) => {
        const kd = Number(args[0])
        if(!MWLobby.kdCheck(args[0])) {
            embed.error(msg, 'KD должно быть целое число от 1 до 4!')
            return
        }

        MWLobby.create(msg, kd, args[1])
    }