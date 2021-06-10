const { VoiceState, Guild, CategoryChannel, Message } = require('discord.js')
const { MessageButton } = require('discord-buttons')
const constants = require('../constants.json')
const tracker = require('../utility/tracker')
const { embed } = require('../utility')
/**
 * Deletes empty rooms 
 * @param {VoiceState} oldState 
 * @param {VoiceState} newState 
 */
module.exports.delete = (oldState, newState) => {
    if(newState.channelID == oldState.channelID)
        return

    if(oldState.channel // Channel exists
        && oldState.channel.parentID == constants.categories.lobbies // Is in lobbies category
        && !oldState.channel.name.includes('#') // Is created by the bot
        && oldState.channel.members.size <= 0 // Is empty
        && Date.now() - oldState.channel.createdTimestamp >= 60000 // Older than a minute
    )
        oldState.channel.delete()
}

/**
 * Deletes empty rooms every minute
 * @param {Guild} guild
 */
module.exports.sweeper = guild => {
    setInterval(() => {
        /**@type {CategoryChannel} */
        const lobbies = guild.channels.cache.get(constants.categories.lobbies)
        // lobbies.children.forEach(c => console.log(c.parentID))

        lobbies.children.forEach(c => {
            if(c.parentID == constants.categories.lobbies// Is in lobbies category
                && !c.name.includes('#') // Is created by the bot
                && c.members.size <= 0 // Is empty
                && Date.now() - c.createdTimestamp >= 60000 // Older than a minute
            )
                c.delete()
        })
    }, 60000)
}

/**
 * Returns a size name for a room
 * @param {2|3|4} size 
 */
module.exports.sizeDecoder = (size) => {
    switch(size) {
        case 2: return 'Duo'
        case 3: return 'Trio'
        case 4: return 'Squad'
    }
}

/**
 * Creates a room and returns message data
 * @param {'warzone'|'modern-warfare'|'cold-war'} game
 * @param {2|3|4} size
 * @param {number} kd 
 * @param {Message} msg 
 * @returns 
 */
module.exports.roomSpawner = async (game, size, kd, msg) => {
    const dg = tracker.gameDecoder(game)
    const sizeName = this.sizeDecoder(size)

    const trioRoom = await msg.guild.channels.create(`${sizeName} ${dg.code.toUpperCase()} KD ${kd}+`, {
        type: 'voice',
        permissionOverwrites: [
            {
                id: constants.roles.mute,
                deny: 'CONNECT'
            }
        ].concat(
            Object.entries(new Object(constants.roles))
                .filter(r => r[0].startsWith(`${dg.code}kd`) && Number(r[0].slice(4)) < kd)
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

    const emb = embed.ok(msg, `${msg.author}, **${sizeName.toUpperCase()}** комната по уровню создана!`, false)
    const inviteLink = (await trioRoom.createInvite()).url
    const button = new MessageButton()
        .setLabel('Ссылка на подключение')
        .setStyle('url')
        .setURL(inviteLink)
    return { embed: emb, component: button }
}
/**
 * Finds a room and returns message data
 * @param {'warzone'|'modern-warfare'|'cold-war'} game
 * @param {2|3|4} size
 * @param {number} kd
 * @param {Message} msg
 * @returns {null|{embed:string, component: MessageButton }}
 */
module.exports.roomFinder = async (game, size, kd, msg) => {
    const dg = tracker.gameDecoder(game)
    const sizeName = this.sizeDecoder(size)

    /**@type {CategoryChannel} */
    const rooms = msg.guild.channels.cache.get(constants.categories.lobbies)
    const trio = rooms.children.find(c =>
        c.name.includes(dg.code.toUpperCase())
        && c.name.includes(sizeName)
        && c.name.includes(`KD ${kd}+`)
        && c.members.size < c.userLimit)

    if(trio) {
        const emb = embed.ok(msg, `${msg.author}, нашел для Вас **${sizeName.toUpperCase()}** комнату по уровню!`, false)
        const inviteLink = (await trio.createInvite()).url
        const button = new MessageButton()
            .setLabel('Ссылка на подключение')
            .setStyle('url')
            .setURL(inviteLink)
        return { embed: emb, component: button }
    }
    return null
}