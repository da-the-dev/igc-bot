const { VoiceState, Guild } = require('discord.js')
const constants = require('../constants.json')

/**
 * Deletes empty rooms 
 *
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
 *
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