const { Guild, VoiceChannel, CategoryChannel, Message } = require('discord.js')
const constants = require('../../constants.json')
const { embed } = require('../../utility')
const Lobby = require('./Lobby')

module.exports = class MWLobby extends Lobby {
    /**
     * Checks if KD is avalid number
     * @param {string} kd 
     * @returns 
     */
    static kdCheck = (kd) => kd === undefined || Number.isInteger(Number(kd)) && Number(kd) >= 0 && Number(kd) < 5

    /**
     * Filter rooms
     * @param {VoiceChannel} c 
     * @param {number} kd 
     * @returns 
     */
    static roomFilter = (c, kd) => {
        if(!Number.isNaN(kd)) // KD is defined
            return Lobby.baseFilter(c)
                && c.name.includes('MW')
                && c.name.includes(`KD ${kd}+`)
        else // KD isn't defined
            return Lobby.baseFilter(c)
                && c.name.includes('MW')

    }

    /**
     * MW lobby constructor
     * @param {VoiceChannel} channel 
     */
    constructor(channel) {
        super('modern-warfare', 6, channel)
    }

    /**
     * Creates a lobby
     * @param {Message} msg
     * @param {number} kd
     * @param {string} create 
     */
    static create(msg, kd, create) {
        if(create == 'create')
            MWLobby.searchNSpawn(msg, kd, true)
        else if(create === undefined)
            MWLobby.searchNSpawn(msg, kd)
        else
            embed.error(msg, 'Неверный параметр команды! Укажите в конце `create`, если хотите создать комнату!')
    }

    /**
     * Creates a Discord VoiceChannel with correct settings
     * @param {number} kd 
     * @param {Guild} guild 
     * @returns
     */
    static async createChannel(kd, guild) {
        if(Number.isNaN(kd)) kd = 1
        return await guild.channels.create(`MW KD ${kd}+`, {
            type: 'voice',
            permissionOverwrites: [
                {
                    id: constants.roles.mute,
                    deny: 'CONNECT'
                }
            ].concat(
                Object.entries(new Object(constants.roles))
                    .filter(r => r[0].startsWith(`mwkd`) && Number(r[0].slice(4)) < kd)
                    .map(r => r[1])
                    .map(r => {
                        return {
                            'id': r,
                            'deny': ['CONNECT']
                        }
                    })
            ),
            userLimit: 6,
            parent: constants.categories.lobbies
        })
    }

    /**
     * Finds a MW lobby and spawns one if needed
     * @param {Message} msg
     * @param {number} kd
     * @param {boolean} create
     * @returns 
     */
    static async searchNSpawn(msg, kd, create = false) {
        /**@type {CategoryChannel} */
        const rooms = msg.guild.channels.cache.get(constants.categories.lobbies)
        const ok = embed.ok(msg, `${msg.author}, нашел для Вас комнату по уровню!`, false)
        const okCreate = embed.ok(msg, `${msg.author}, создал для Вас комнату по уровню!`, false)

        if(!create) {
            const room = rooms.children.find(c => MWLobby.roomFilter(c, kd))
            if(room) {
                const lobby = new MWLobby(room)
                msg.channel.send(`<@&${constants.roles.mw}>`, { embed: ok, component: await lobby.createInviteButton() })
            }
            else {
                const message = await embed.warning(msg, `${msg.author}, комната по уровню не найдена, создаю...`)
                const lobby = new MWLobby(await this.createChannel(kd, msg.guild))
                message.edit(`<@&${constants.roles.mw}>`, { embed: okCreate, component: await lobby.createInviteButton() })
            }
        } else {
            const lobby = new MWLobby(await this.createChannel(kd, msg.guild))
            msg.channel.send(`<@&${constants.roles.mw}>`, { embed: okCreate, component: await lobby.createInviteButton() })
        }
    }

    /**
     * Starts a votekick of a member
     * @param {Member} member 
     */
    voteKick(member) {

    }
}