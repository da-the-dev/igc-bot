const { Guild, VoiceChannel, GuildMember, Message } = require('discord.js')
const { MessageButton } = require('discord-buttons')
const { embed } = require('../../utility')

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

    /**
     * Starts a votekick of an accused member
     * @param {Message} msg
     * @param {GuildMember} voter
     * @param {GuildMember} accused
     */
    async voteKick(msg, voter, accused) {
        if(voter.voice.channel.userLimit <= 2)
            embed.error(msg, 'Вы не можете начать голосование, так как в комнате слишком мало участников!')

        const emb = embed.warning(msg, `${voter} хочет кикнуть ${accused}`, false)

        const yes = new MessageButton()
            .setID(`${accused.voice.channel.id}_${accused.id}_votekick_yes`)
            .setStyle('gray')
            .setEmoji('✅')
        const no = new MessageButton()
            .setID(`${accused.voice.channel.id}_${accused.id}_votekick_no`)
            .setStyle('gray')
            .setEmoji('❌')

        const m = await msg.channel.send({ embed: emb, buttons: [yes, no] })

        const filter = (button) => button.clicker.member.voice.channelID === voter.voice.channelID;
        const collector = m.createButtonCollector(filter, { time: 60000, max: Math.floor(this.size * 0.75) }); //collector for 5 seconds

        collector.on('collect', b => console.log(`Collected button with the id ${b.id}`));
        collector.on('end', collected => console.log(`Collected ${collected.size} items`));
    }
}