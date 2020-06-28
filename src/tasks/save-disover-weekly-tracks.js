import _debug from 'debug'
import CONSTANTS from '../constants'
import getPlaylists from '../modules/get-playlists'
import getTracksFromPlaylist from '../modules/get-trackIds-from-playlist'
import addTracksToPlaylist from '../modules/add-tracks-to-playlist'
import path from 'path' 
import { pick, find, map } from 'lodash'

const debug = _debug('task:save-discover-weekly-tracks')

const addDisoverTracks = async ({ spore }) => {
  debug(`
    Adding discover weekly tracks 
    from ${CONSTANTS.PLAYLISTS.DISCOVER_WEEKLY} 
    to ${CONSTANTS.PLAYLISTS.SpotifyDiscoverWeekly}...
  `)
  const trackIds = await getTracksFromPlaylist({ 
    sourcePlaylistName: CONSTANTS.PLAYLISTS.DISCOVER_WEEKLY,
    spore
  })
  
  debug(`Fetched ${trackIds.length} from playlist ${CONSTANTS.PLAYLISTS.DISCOVER_WEEKLY}`)
  
  const addResult = await addTracksToPlaylist({
    destinationPlaylistName: CONSTANTS.PLAYLISTS.SpotifyDiscoverWeekly,
    trackIds,
    spore
  })
}

const run = async ({ spore, config }) => {
  try {
    debug(`Running task ${config.taskName}...`)
    const playlists = await getPlaylists({ spore })
    spore.cacheUserData({ playlists })
    await addDisoverTracks({ spore })
  } catch (err) {
    debug(`Error encountered while running ${config.taskName}`, err)
    throw err
  }
}

export default run
