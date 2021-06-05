const { Presence } = require("discord.js");

/**
 * Gives LIVE role to currently active streamers
 * @param {Presence} presence 
 */
module.exports = presence => {
    if(presence.activities.find(a => a.type == "STREAMING"))
        presence.member.roles.add(constants.roles.live)
    else
        if(presence.member.roles.cache.has(constants.roles.live))
            presence.member.roles.remove(constants.roles.live)
}