import _debug from 'debug'

const debug = _debug('task:test')

const run = async ({ spore, config }) => {
  try {
    debug(`Running task ${config.taskName}...`)
  } catch (err) {
    debug(`Error encountered while running task ${config.taskName}`, err)
    throw err
  }
}

export default run
