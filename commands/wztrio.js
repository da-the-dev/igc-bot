const { Message, Client } = require('discord.js')
const { embed, lobbiesManager } = require('../utility')
const constants = require('../constants.json')

module.exports =
    /**
    * @param {Array<string>} args Command argument
    * @param {Message} msg Discord message object
    * @param {Client} client Discord client object
    * @description Usage: .wztrio <?kd>
    */
    async (args, msg, client) => {
        const kd = Number(args[0])
        if(!kd || !Number.isInteger(kd) || kd < 0 || kd > 5) {
            embed.error(msg, 'KD должно быть целое число от 1 до 4!')
            return
        }

        const create = args[1]
        if(!create) {
            const roomData = await lobbiesManager.roomFinder('warzone', 3, kd, msg)
            if(roomData)
                msg.channel.send(`<@&${constants.roles.wz}>`, roomData)
            else {
                const message = await embed.warning(msg, `${msg.author}, **TRIO** комната по уровню не найдена, создаю...`)
                const roomData = await lobbiesManager.roomSpawner('warzone', 3, kd, msg)
                message.edit(`<@&${constants.roles.wz}>`, roomData)
            }
        } else if(create == 'create') {
            const roomData = await lobbiesManager.roomSpawner('warzone', 3, kd, msg)
            message.edit(`<@&${constants.roles.wz}>`, roomData)
        }
        else
            embed.error(msg, 'Неверный параметр команды! Укажите в конце `create`, если хотите создать комнату!')
    }