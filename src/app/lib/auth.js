const crypto = require('crypto')
const { userConfigId } = require('../common/constants')
const { dbAction } = require('./nedb')
const axios = require('axios')
const getPort = require('./get-port')

axios.defaults.proxy = false

function hashPassword (password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return { salt, hashedPassword }
}

function comparePasswords (password, salt, hashedPassword) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return hash === hashedPassword
}

exports.setPassword = async function setPassword (password) {
  const q = {
    _id: userConfigId
  }
  const userConfig = await dbAction('data', 'findOne', q) || {}
  if (password === '') {
    await dbAction('data', 'update', q, {
      ...q,
      ...userConfig,
      salt: '',
      hashedPassword: ''
    }, {
      upsert: true
    })
    return true
  }
  const { salt, hashedPassword } = hashPassword(password)
  await dbAction('data', 'update', q, {
    ...q,
    ...userConfig,
    salt,
    hashedPassword
  }, {
    upsert: true
  })
  return true
}

exports.checkPassword = async function checkPassword (password) {
  if (!password) {
    return false
  }
  const q = {
    _id: userConfigId
  }
  const { salt, hashedPassword } = await dbAction('data', 'findOne', q) || {}
  const r = comparePasswords(password, salt, hashedPassword)
  if (r) {
    const port = await getPort()
    await axios.post(`http://127.0.0.1:${port}/auth`, {
      token: hashedPassword
    })
  }
  return r
}
