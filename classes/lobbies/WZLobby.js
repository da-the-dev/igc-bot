const { Guild, VoiceChannel, CategoryChannel, Message } = require('discord.js')
const constants = require('../../constants.json')
const { embed } = require('../../utility')
const Lobby = require('./Lobby')

module.exports = class WZLobby extends Lobby {
    /**
     * Checks if KD is avalid number
     * @param {string} kd 
     * @returns 
     */
    static kdCheck = (kd) => kd === undefined || Number.isInteger(Number(kd)) && Number(kd) >= 0 && Number(kd) < 5

    /**
     * Decodes sizes 
     * @param {2|3|4} size 
     * @returns 
     */
    static sizeDecoder(size) {
        switch(size) {
            case 2: return 'Duo'
            case 3: return 'Trio'
            case 4: return 'Squad'
        }
    }

    /**
     * Filter rooms
     * @param {VoiceChannel} c 
     * @param {string} sizeName 
     * @param {number} kd 
     * @returns 
     */
    static roomFilter = (c, sizeName, kd) => {
        if(!Number.isNaN(kd)) // KD is defined
            return Lobby.baseFilter(c)
                && c.name.includes('WZ')
                && c.name.includes(sizeName)
                && c.name.includes(`KD ${kd}+`)
        else // KD isn't defined
            return Lobby.baseFilter(c)
                && c.name.includes('WZ')
                && c.name.includes(sizeName)

    }

    /**
     * WZ lobby constructor
     * @param {number} size 
     * @param {VoiceChannel} channel 
     */
    constructor(size, channel) {
        super('warzone', size, channel)
    }

    /**
     * Creates a lobby
     * @param {Message} msg
     * @param {number} size
     * @param {number} kd
     * @param {string} create 
     */
    static create(msg, size, kd, create) {
        if(create == 'create')
            WZLobby.searchNSpawn(msg, size, kd, true)
        else if(create === undefined)
            WZLobby.searchNSpawn(msg, size, kd)
        else
            embed.error(msg, 'Неверный параметр команды! Укажите в конце `create`, если хотите создать комнату!')
    }

    /**
     * Creates a Discord VoiceChannel with correct settings
     * @param {number} size 
     * @param {number} kd 
     * @param {Guild} guild 
     * @returns
     */
    static async createChannel(size, kd, guild) {
        if(Number.isNaN(kd)) kd = 1
        return await guild.channels.create(`WZ ${this.sizeDecoder(size)} KD ${kd}+`, {
            type: 'voice',
            permissionOverwrites: [
                {
                    id: constants.roles.mute,
                    deny: 'CONNECT'
                }
            ].concat(
                Object.entries(new Object(constants.roles))
                    .filter(r => r[0].startsWith(`wzkd`) && Number(r[0].slice(4)) < kd)
                    .map(r => r[1])
                    .map(r => {
                        return {
                            'id': r,
                            'deny': ['CONNECT']
                        }
                    })
            ),
            userLimit: size,
            parent: constants.categories.lobbies
        })
    }

    /**
     * Finds a WZ lobby and spawns one if needed
     * @param {Message} msg
     * @param {number} size 
     * @param {number} kd
     * @param {boolean} create
     * @returns 
     */
    static async searchNSpawn(msg, size, kd, create = false) {
        const sizeName = WZLobby.sizeDecoder(size)
        /**@type {CategoryChannel} */
        const rooms = msg.guild.channels.cache.get(constants.categories.lobbies)
        const ok = embed.ok(msg, `${msg.author}, нашел для Вас **${sizeName.toUpperCase()}** комнату по уровню!`, false)
        const okCreate = embed.ok(msg, `${msg.author}, создал для Вас **${sizeName.toUpperCase()}** комнату по уровню!`, false)

        if(!create) {
            const room = rooms.children.find(c => WZLobby.roomFilter(c, sizeName, kd))
            if(room) {
                const lobby = new WZLobby(size, room)
                msg.channel.send(`<@&${constants.roles.wz}>`, { embed: ok, component: await lobby.createInviteButton() })
            }
            else {
                const message = await embed.warning(msg, `${msg.author}, **${sizeName.toUpperCase()}** комната по уровню не найдена, создаю...`)
                const lobby = new WZLobby(size, await this.createChannel(size, kd, msg.guild))
                message.edit(`<@&${constants.roles.wz}>`, { embed: okCreate, component: await lobby.createInviteButton() })
            }
        } else {
            const lobby = new WZLobby(size, await this.createChannel(size, kd, msg.guild))
            msg.channel.send(`<@&${constants.roles.wz}>`, { embed: okCreate, component: await lobby.createInviteButton() })
        }
    }

    /**
     * Starts a votekick of a member
     * @param {Member} member 
     */
    voteKick(member) {

    }
}