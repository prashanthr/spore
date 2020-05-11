import _debug from 'debug'
import path from 'path' 
import { readFromFile } from './utils/file'
import Spore from './spore'
import CONSTANTS from './constants'
import taskMap from './tasks/task-map'

const debug = _debug('main')

const main = async () => {
  const { SPORE_TASKS, SPOTIFY_ACCESS_TOKEN, SPOTIFY_REFRESH_TOKEN, SPOTIFY_USERNAME, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_AUTH_URL } = process.env
  
  const tasks = SPORE_TASKS && SPORE_TASKS.split(',')
  if (!tasks || tasks.length === 0) {
    debug('No tasks to run, exiting...')
    return
  }

  const SAVED_SPOTIFY_ACCESS_TOKEN = await readFromFile(path.resolve(__dirname, CONSTANTS.FILENAME.SPOTIFY_ACCESS_TOKEN))
  const SAVED_SPOTIFY_REFRESH_TOKEN = await readFromFile(path.resolve(__dirname, CONSTANTS.FILENAME.SPOTIFY_REFRESH_TOKEN))
  // debug('read tokens', SAVED_SPOTIFY_ACCESS_TOKEN, SAVED_SPOTIFY_REFRESH_TOKEN)
  
  const spore = new Spore({
    accessToken: SAVED_SPOTIFY_ACCESS_TOKEN || SPOTIFY_ACCESS_TOKEN,
    refreshToken: SAVED_SPOTIFY_REFRESH_TOKEN || SPOTIFY_REFRESH_TOKEN,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    clientId: SPOTIFY_CLIENT_ID
  })

  // Auth
  debug('Auth url', SPOTIFY_AUTH_URL)
  const canContinue = await spore.authFlow(SPOTIFY_AUTH_URL)
  if (!canContinue) {
    return
  }
  
  // Run tasks
  debug('Tasks to run: ', tasks)
  for (let task of tasks) {
    const taskExecutable = taskMap[task]
    if (taskExecutable) {
      await taskExecutable({
        spore,
        config: { taskName: task }
      })
    } else {
      debug(`No task found for ${task}`)
    }
  }
}

main()
  .catch(err => debug('Error running script', JSON.stringify(err)))
