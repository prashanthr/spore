import _debug from 'debug'
import PlaylistService from './playlist-service'
import { pick, find, map } from 'lodash'
import Spore from './spore'
import { readFromFile } from './utils/file'
import CONSTANTS from './constants'
import path from 'path' 
import { constants } from 'buffer'

const debug = _debug('main')

const main = async () => {
  const { SPOTIFY_ACCESS_TOKEN, SPOTIFY_REFRESH_TOKEN, SPOTIFY_USERNAME, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_AUTH_URL } = process.env
  const SAVED_SPOTIFY_ACCESS_TOKEN = await readFromFile(path.resolve(__dirname, CONSTANTS.FILENAME.SPOTIFY_ACCESS_TOKEN))
  const SAVED_SPOTIFY_REFRESH_TOKEN = await readFromFile(path.resolve(__dirname, CONSTANTS.FILENAME.SPOTIFY_REFRESH_TOKEN))
  debug('read tokens', SAVED_SPOTIFY_ACCESS_TOKEN, SAVED_SPOTIFY_REFRESH_TOKEN)
  const spore = new Spore({
    accessToken: SAVED_SPOTIFY_ACCESS_TOKEN || SPOTIFY_ACCESS_TOKEN,
    refreshToken: SAVED_SPOTIFY_REFRESH_TOKEN || SPOTIFY_REFRESH_TOKEN,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    clientId: SPOTIFY_CLIENT_ID
  })
  
  debug('Auth url', SPOTIFY_AUTH_URL)
  const canContinue = await spore.authFlow(SPOTIFY_AUTH_URL)
  if (!canContinue) {
    return
  }

  const collectPlaylists = async () => {
    let offset = 0
    const limit = 50
    let playlists = []
  
    const getPlaylists = async (offset, limit = 50) => {
      const res = await spore.getAllPlaylists(undefined, { offset, limit })
      debug('res', res)
      return res.items || []
    }
    const loop = async () => {
      if (offset <= 1000) {
        const ps = await getPlaylists(offset)
        playlists = [...playlists, ...ps.map(i => pick(i, ['id', 'name', 'uri']))]
        offset += 50
        await loop()
      }
    }
    await loop()
    debug(find(playlists, p => p.name === CONSTANTS.PLAYLISTS.DISCOVER_WEEKLY))
    debug(find(playlists, p => p.name === CONSTANTS.PLAYLISTS.SpotifyDiscoverWeekly))
    spore.cacheUserData({ playlists })
  }

  const addDisoverTracks = async () => {
    const playlistData = await spore.getAllTracksInPlaylist(
      spore.user.playlists.name[CONSTANTS.PLAYLISTS.DISCOVER_WEEKLY].id
    )
    const trackIds = map(playlistData.tracks.items, item => item.track.uri)
    debug('Track Ids', trackIds)
    const addRes = await spore.addTracksToPlaylist(
      spore.user.playlists.name[CONSTANTS.PLAYLISTS.SpotifyDiscoverWeekly].id,
      trackIds
    )
    debug('Add Result', addRes)
  }

  await collectPlaylists()
  await addDisoverTracks()
}

main()
  .catch(err => debug('Error running script', JSON.stringify(err)))
