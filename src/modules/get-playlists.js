import { isEmpty, pick } from 'lodash'
import _debug from 'debug'
const debug = _debug('module:copy-playlist')

/**
 * Gets all the playlists
 * @param {*} spore The spore object with cached playlist data
 */
const getPlaylists = async ({
  spore
}) => {
  debug('Fetching all playlists...')
  let offset = 0
  const OFFSET_STEP = 100
  const MAX_OFFSET = 1000
  let playlists = []

  const getPlaylists = async (offset, limit = OFFSET_STEP) => {
    const res = await spore.getAllPlaylists(undefined, { offset, limit })
    // debug('res', res)
    return res.items || []
  }
  const loopThroughPlaylists = async () => {
    debug(`Fetching playlists for offset ${offset}...`)
    if (offset <= MAX_OFFSET) {
      const ps = await getPlaylists(offset)
      playlists = [...playlists, ...ps.map(i => pick(i, ['id', 'name', 'uri']))]
      offset += OFFSET_STEP
      await loopThroughPlaylists()
    }
  }
  await loopThroughPlaylists()
  return playlists
}

export default getPlaylists
