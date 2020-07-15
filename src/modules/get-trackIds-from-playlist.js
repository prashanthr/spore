import { isEmpty, map, pick } from 'lodash'
import _debug from 'debug'
const debug = _debug('spore:module:get-tracks-from-playlist')

const getTrackIds = async ({ sourcePlaylistName, spore }) => {
  debug(`Getting track ids from ${sourcePlaylistName}...`)
  if (!spore.user || !spore.user.playlists || isEmpty(spore.user.playlists)) {
    debug('No playlists cached. Exiting...')
    return
  }
  
  let tracks = []
  let globalOffset = 0
  const MAX_OFFSET = 1000
  const OFFSET_STEP = 100

  const getTracks = async (playlistId, offset, limit) => {
    const res = await spore.getAllTracksInPlaylist(playlistId, { offset, limit })
    // debug('res', res)
    return res.items || []
  }
  const loopThroughTracks = async (playlistId, offset, limit = OFFSET_STEP) => {
    debug(`Fetching tracks from playlist for offset ${offset}...`)
    if (offset <= MAX_OFFSET) {
      const trks = await getTracks(playlistId, offset, limit)
      // debug('tracks', trks)
      tracks = [...tracks, ...trks.map(i => pick(i.track, ['id', 'name', 'uri']))]
      globalOffset += 100
      await loopThroughTracks(playlistId, globalOffset)
    }
  }
  await loopThroughTracks(spore.user.playlists.name[sourcePlaylistName].id, globalOffset)
  debug(`Fetched ${tracks.length} from ${sourcePlaylistName}`)
  const trackIds = map(tracks, trk => trk.uri)
  return trackIds
}

export default getTrackIds
