const { Presence } = require("discord.js");
const constants = require('../constants.json')

/**
 * Gives LIVE role to currently active streamers
 * @param {Presence} presence 
 */
module.exports = presence => {
    if(presence.activities.find(a => a.type == "STREAMING")
        && presence.member.roles.cache.find(r => [
            "355307608648843264",
            "777264089797754901",
            "703317566734598166"
        ].includes(r.id)))
        presence.member.roles.add(constants.roles.live)
    else
        if(presence.member.roles.cache.has(constants.roles.live))
            presence.member.roles.remove(constants.roles.live)
}