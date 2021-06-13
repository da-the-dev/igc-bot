const { Guild, VoiceChannel } = require('discord.js')
const { MessageButton } = require('discord-buttons')

module.exports = class Lobby {
    /** @type {string}*/ static guildID = '353929650734628874'
    /** @type {'warzone'|'modern-warfare'|'cold-war'|'wot'|'wotblitz'}*/ game
    /** @type {number}*/ size
    /** @type {VoiceChannel}*/ channel
    /** @type {Guild} */ guild

    /**
     * Base filter that only lets though channels that are bot created
     * @param {VoiceChannel} c 
     * @returns 
     */
    static baseFilter = c =>
        !c.name.includes('#')
        && c.members.size < c.userLimit

    /**
     * Base lobby constructor
     * @param {'warzone'|'modern-warfare'|'cold-war'|'wot'|'wotblitz'} game
     * @param {number} size
     * @param {VoiceChannel} channel
     */
    constructor(game, size, channel) {
        if(!channel) {
            console.trace(); throw 'No channel in Lobby constructor!'
        }
        this.game = game
        this.size = size
        this.channel = channel
        this.guild = channel.guild
    }

    /**
     * Create and return Discord button with invite link
     */
    async createInviteButton() {
        const inviteLink = (await this.channel.createInvite()).url
        return new MessageButton()
            .setLabel('Ссылка на подключение')
            .setStyle('url')
            .setURL(inviteLink)
    }
}