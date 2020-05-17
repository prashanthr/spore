import _debug from 'debug'
import CONSTANTS from '../constants'
import path from 'path' 
import { pick, find, map } from 'lodash'

const debug = _debug('task:save-discover-weekly-tracks')

const collectPlaylists = async ({ spore }) => {
  debug('Collecting all playlists...')
  let offset = 0
  const limit = 50
  let playlists = []

  const getPlaylists = async (offset, limit = 50) => {
    const res = await spore.getAllPlaylists(undefined, { offset, limit })
    debug('res', res)
    return res.items || []
  }
  const loopThroughPlaylists = async () => {
    debug(`Fetching playlists for offset ${offset}...`)
    if (offset <= 1000) {
      const ps = await getPlaylists(offset)
      playlists = [...playlists, ...ps.map(i => pick(i, ['id', 'name', 'uri']))]
      offset += 50
      await loopThroughPlaylists()
    }
  }
  await loopThroughPlaylists()
  debug('Playlist Disover Weekly: ', find(playlists, p => p.name === CONSTANTS.PLAYLISTS.DISCOVER_WEEKLY))
  debug('Playlist #SpotifyDiscoverWeekly: ', find(playlists, p => p.name === CONSTANTS.PLAYLISTS.SpotifyDiscoverWeekly))
  return playlists
}

const addDisoverTracks = async ({ spore }) => {
  debug(`
    Adding discover weekly tracks 
    from ${CONSTANTS.PLAYLISTS.DISCOVER_WEEKLY} 
    to ${CONSTANTS.PLAYLISTS.SpotifyDiscoverWeekly}...
  `)
  const playlistData = await spore.getAllTracksInPlaylist(
    spore.user.playlists.name[CONSTANTS.PLAYLISTS.DISCOVER_WEEKLY].id
  )
  const trackIds = map(playlistData.tracks.items, item => item.track.uri)
  debug('Track Ids: ', trackIds)
  
  const addResult = await spore.addTracksToPlaylist(
    spore.user.playlists.name[CONSTANTS.PLAYLISTS.SpotifyDiscoverWeekly].id,
    trackIds
  )
  debug('Add Result: ', addResult)
}

const run = async ({ spore, config }) => {
  try {
    debug(`Running task ${config.taskName}...`)
    const playlists = await collectPlaylists({ spore })
    spore.cacheUserData({ playlists })
    await addDisoverTracks({ spore })
  } catch (err) {
    debug(`Error encountered while running ${config.taskName}`, err)
    throw err
  }
}

export default run
