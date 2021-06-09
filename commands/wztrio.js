const { Message, Client, CategoryChannel } = require('discord.js')
const { embed } = require('../utility')
const constants = require('../constants.json')
const { MessageButton } = require('discord-buttons')

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

        /**@type {CategoryChannel} */
        const rooms = msg.guild.channels.cache.get('560124689645699072')
        const trio = rooms.children.find(c => c.name.includes('WZ') && c.name.includes('Trio') && c.name.includes(`KD ${kd}+`))

        if(trio) {
            const emb = await embed.ok(msg, `${msg.author}, нашел для Вас трио комнату по уровню!`, false)
            const inviteLink = (await trio.createInvite()).url
            const button = new MessageButton()
                .setLabel('Ссылка на подключение')
                .setStyle('url')
                .setURL(inviteLink)

            msg.channel.send(`<@&${constants.roles.wz}>`, { embed: emb, component: button })
        } else {
            const message = await embed.warning(msg, `${msg.author}, трио комната по уровню не найдена, создаю...`)
            const trioRoom = await msg.guild.channels.create(`Trio WZ KD ${kd}+`, {
                type: 'voice',
                permissionOverwrites: [
                    {
                        id: constants.roles.mute,
                        deny: 'CONNECT'
                    }
                ].concat(
                    Object.entries(new Object(constants.roles))
                        .filter(r => r[0].startsWith('wzkd') && Number(r[0].slice(4)) < kd)
                        .map(r => r[1])
                        .map(r => {
                            return {
                                'id': r,
                                'deny': ['CONNECT']
                            }
                        })
                ),
                userLimit: 3,
                parent: rooms
            })
            const emb = await embed.ok(msg, `${msg.author}, трио комната по уровню создана!`, false)

            const inviteLink = (await trioRoom.createInvite()).url
            const button = new MessageButton()
                .setLabel('Ссылка на подключение')
                .setStyle('url')
                .setURL(inviteLink)
            message.edit(`<@&${constants.roles.wz}>`, { embed: emb, component: button })
        }
    }