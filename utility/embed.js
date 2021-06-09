const { Message, MessageEmbed } = require('discord.js')

/**
 * Creates a default message with author 
 * @param {Message} msg 
 * @returns 
 */
const standard = (msg) => {
    return new MessageEmbed()
        .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
}

/**
 * OK reply
 * @param {Message} msg 
 * @param {tring} content 
 */
module.exports.ok = (msg, content) => {
    msg.channel.send(
        new MessageEmbed(standard(msg))
            .setDescription(`:white_check_mark: ${content}`)
            .setColor('00D084')
    )
}

/**
 * Warning reply
 * @param {Message} msg
 * @param {tring} content
 */
module.exports.warning = (msg, content) => {
    msg.channel.send(new MessageEmbed(standard(msg))
        .setDescription(`:warning: ${content}`)
        .setColor('FF6900'))
}

/**
 * Error reply
 * @param {Message} msg
 * @param {tring} content
 */
module.exports.error = (msg, content) => {
    msg.channel.send(new MessageEmbed(standard(msg))
        .setDescription(`:no_entry_sign: ${content}`)
        .setColor('FF0000'))
}