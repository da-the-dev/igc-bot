require('dotenv').config()

const MongoClient = require('mongodb').MongoClient
/**@type {Array<Connection>} */
var connections = []

class Connection {
    /**@type {MongoClient} */
    #connection

    static closeAll() {
        connections.forEach(c => c.close())
    }

    /**
     * Establishes a connection via promise
     * @returns {Promise<Connection>}
     */
    constructor() {
        return new Promise(async (resolve, reject) => {
            this.#connection = await new MongoClient(process.env.MURL, { useNewUrlParser: true, useUnifiedTopology: true }).connect()
            connections.push(this)
            resolve(this)
        })
    }
    get connection() {
        return this.#connection
    }
    close() {
        if(this.#connection.isConnected())
            this.#connection.close()
    }

    ////// BASIC METODS \\\\\\
    /**
     * Gets data about a key from a guild
     * @param {string} guildID - Guild ID
     * @param {string} uniqueID - Unique ID
     * @return {Promise<any>} Info about the key
     */
    get(guildID, uniqueID) {
        return new Promise(async (resolve, reject) => {
            if(!guildID) reject('No guild ID [get]!')
            if(!uniqueID) reject('No unique ID [get]!')

            var res = this.#connection.db('motodori').collection(guildID).findOne({ id: uniqueID })

            res ? (
                res._id ? delete res._id : null,
                res.id ? delete res.id : null
            ) : res = {}

            resolve(res)
        })
    }
    /**
     * Set data about a key from a guild
     * @param {string} guildID - Guild ID
     * @param {string} uniqueID - Unique ID
     * @param {object} data - Data to set
     * @returns {Promise<string>} Returns 'OK' if set succesfully
     */
    set(guildID, uniqueID, data) {
        return new Promise((resolve, reject) => {
            if(!guildID) reject('No guild ID [set]!')
            if(!uniqueID) reject('No unique ID [set]!')
            if(!data) reject('No data to set [set]!')

            this.get(guildID, uniqueID).then(async res => {
                const newData = { ...{ id: uniqueID }, ...data }
                if(res) {
                    this.#connection.db('motodori').collection(guildID).findOneAndReplace({ id: uniqueID }, newData).then(() => {
                        resolve('OK')
                    })
                } else {
                    this.#connection.db('motodori').collection(guildID).insertOne(newData).then(() => {
                        resolve('OK')
                    })
                }
            })
        })
    }

    /**
     * Update data about a key from a guild
     * @param {string} guildID - Guild ID
     * @param {string} uniqueID - Unique ID
     * @param {object} query - Queries to update
     * @returns {Promise<string>} Returns 'OK' if update succesfully
     */
    update(guildID, uniqueID, query) {
        return new Promise((resolve, reject) => {
            if(!guildID) reject('No guild ID [update]!')
            if(!uniqueID) reject('No unique ID [update]!')
            if(!query) reject('No query to update [update]!')

            this.#connection.db('motodori').collection(guildID).updateOne({ id: uniqueID }, query, { upsert: true })
                .then(() => resolve('OK'))
                .catch(err => reject(err))
        })
    }


    /**
     * Gets data about many keys from a guild
     * @param {string} guildID - Guild ID
     * @param {object} query - Query to use as a filter
     * @return {Promise<Array<any>>} Info about the keys
     */
    getMany(guildID, query) {
        return new Promise((resolve, reject) => {
            this.#connection.db('motodori').collection(guildID).find(query).toArray()
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
    }

    /**
     * Updates data about many keys from a guild
     * @param {string} guildID - Guild ID
     * @param {object} filter - Query to use as a filter
     * @param {object} update - Query to update documents with
     * @return {Promise<any>} Info about the keys
     */
    updateMany(guildID, filter, update) {
        return new Promise((resolve, reject) => {
            if(!guildID) reject('No guild ID [updateMany]!')
            if(!filter) reject('No filter [updateMany]!')
            if(!update) reject('No update query [updateMany]!')
            this.#connection.db('motodori').collection(guildID).updateMany(filter, update, { upsert: true })
                .then(() => resolve('OK'))
                .catch(err => reject(err))
        })
    }

    /**
     * Deletes a document
     * @param {string} guildID - Guild ID
     * @param {string} uniqueID - Unique ID
     * @return {Promise<string>} 'OK' if deleted succesfully 
     */
    delete(guildID, uniqueID) {
        return new Promise((resolve, reject) => {
            if(!guildID) reject('No guild ID [delete]!')
            if(!uniqueID) reject('No unique ID [delete]!')

            this.#connection.db('motodori').collection(guildID).deleteOne({ id: uniqueID })
                .then(() => resolve('OK'))
                .catch(err => reject(err))
        })
    }
    /**
     * Deletes many document
     * @param {string} guildID - Guild ID
     * @param {obj} query - Query to use a filter
     * @return {Promise<string>} 'OK' if deleted succesfully 
     */
    deleteMany(guildID, query) {
        return new Promise((resolve, reject) => {
            if(!guildID) reject('No guild ID [deleteMany]!')
            if(!query) reject('No query [deleteMany]!')

            this.#connection.db('motodori').collection(guildID).deleteMany(query)
                .then(() => resolve('OK'))
                .catch(err => reject(err))
        })
    }
}

class DBUser {
    /**@type {Connection} DB connection*/ #connection
    /**@type {string} User's guild ID*/ #guildID
    /**@type {string} User's ID*/ #id

    /**@type {string} Warzone nickname*/ wz
    /**@type {string} Modern warfare nickname*/ mdwf
    /**@type {string} Cold war nickname*/ cw

    /**
    * Retrieves data about a user
    * @param {string} guildID
    * @param {string} id
    * @return {Promise<DBUser>}
    */
    constructor(guildID, id) {
        return new Promise(async (resolve, reject) => {
            this.#guildID = guildID
            this.#id = id

            this.#connection = getConnection()
            const userData = await this.#connection.get(guildID, id) || {}

            this.wz = userData.wz
            this.mdwf = userData.mdwf
            this.cw = userData.cw

            resolve(this)
        })
    }

    get() {
        /**@type {UserData}*/ var userData = {}

        this.#id ? userData.id = this.#id : null

        this.wz ? userData.wz = this.wz : null
        this.mdwf ? userData.mdwf = this.mdwf : null
        this.cw ? userData.cw = this.cw : null

        return userData
    }

    save() {
        return new Promise(async (resolve, reject) => {
            await this.#connection.set(this.#guildID, this.#id, this.get())
            resolve('OK')
        })
    }
}

/**@returns {Connection} */
function getConnection() {
    return connections.find(c => c.connection.isConnected())
}

module.exports.Connection = Connection
module.exports.DBUser = DBUser
module.exports.getConnection = getConnection