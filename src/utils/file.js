import fs from 'fs'
import util from 'util'
import _debug from 'debug'

const debug = _debug('util:file')

const readFileFS = util.promisify(fs.readFile)
const writeFileFS = util.promisify(fs.writeFile)

export const writeToFileStream = async (data, fileName) => {
  let writeStream = fs.createWriteStream(fileName)
  const buffer = new Buffer(data).toString('base64')
  writeStream.write(buffer, 'utf8')
  writeStream.on('finish', () => debug(`Succesfully written to file ${fileName}`))
  writeStream.on('error', (err) => debug(`Error writing to file ${fileName}`))

}

export const writeToFile = async (data, fileName) => {
  try {
    debug(`Writing to file ${fileName}`, data)
    await writeFileFS(fileName, Buffer.from(data, 'utf8'))
    debug(`Successfully written to file ${fileName}`)
  } catch (err) {
    debug(`Unable to write to file ${fileName}`, err)
    throw err
  }
}

export const readFromFile = async (fileName) => {
  try {
    debug(`Reading from file ${fileName}`)
    const read = await readFileFS(fileName, 'utf8')
    debug('read', read)
    return read
  } catch (err) {
    debug(`Error reading from file ${fileName}`)
    throw err
  }
}