const { Message, MessageEmbed } = require('discord.js')

/**
 * Creates a default message with author 
 *
 * @param {Message} msg 
 * @returns 
 */
const standard = (msg) => {
    return new MessageEmbed()
        .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
}

/**
 * OK reply
 *
 * @param {Message} msg 
 * @param {string} content 
 * @param {boolean} [send]
 * @returns {Promise<Message>|MessageEmbed}
 */
module.exports.ok = (msg, content, send = true) => {
    const emb = new MessageEmbed(standard(msg))
        .setDescription(`:white_check_mark: ${content}`)
        .setColor('00D084')
    if(send)
        return msg.channel.send(emb)
    else
        return emb
}

/**
 * Warning reply
 *
 * @param {Message} msg
 * @param {string} content
 * @param {boolean} [send]
 * @returns {MessageEmbed|Message}
 */
module.exports.warning = (msg, content, send = true) => {
    const emb = new MessageEmbed(standard(msg))
        .setDescription(`:warning: ${content}`)
        .setColor('FF6900')
    if(send)
        return msg.channel.send(emb)
    else
        return emb
}

/**
 * Error reply
 *
 * @param {Message} msg
 * @param {string} content
 * @param {boolean} [send]
 * @returns {MessageEmbed|Message}
 */
module.exports.error = (msg, content, send = true) => {
    const emb = new MessageEmbed(standard(msg))
        .setDescription(`:no_entry_sign: ${content}`)
        .setColor('FF0000')
    if(send)
        return msg.channel.send(emb)
    else
        return emb
}