const { Connection } = require('./db')

/**
 * Starts a few connections
 *
 * @param {number} amount 
 */
module.exports.startconnections = async (amount) => {
    var connectionPromises = []
    for(let i = 0; i < amount; i++)
        connectionPromises.push(new Connection())

    await Promise.all(connectionPromises)
}

/**
 * Closes all open connections
 */
module.exports.closeConnections = () => {
    Connection.closeAll()
}