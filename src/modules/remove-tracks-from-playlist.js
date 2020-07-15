import { isEmpty, chunk } from 'lodash'
import getTrackIdsFromPlaylist from './get-trackIds-from-playlist'
import _debug from 'debug'
const debug = _debug('spore:module:add-tracks-to-playlist')

const removeTracksFromPlaylist = async ({ playlistName, trackIds, spore, removeAll = false }) => {
  if (!spore.user || !spore.user.playlists || isEmpty(spore.user.playlists)) {
    debug('No playlists cached. Exiting...')
    return
  }
  let resolvedTrackIds = []
  if (removeAll) {
    resolvedTrackIds = await getTrackIdsFromPlaylist({ sourcePlaylistName: playlistName, spore })
  } else {
    resolvedTrackIds = trackIds
  }
  const destinationPlaylistId = spore.user.playlists.name[playlistName].id
  debug(`Removing ${resolvedTrackIds.length} track(s) from ${playlistName} (${destinationPlaylistId})`)
  // 100 limit - https://developer.spotify.com/documentation/web-api/reference/playlists/add-tracks-to-playlist/
  const trackGroups = chunk(resolvedTrackIds, 100) 
  for (const group of trackGroups) {
    const deleteResult = await spore.removeTracksFromPlaylist(
      destinationPlaylistId,
      group
    )
    debug('Delete Result: ', deleteResult)
  }
}

export default removeTracksFromPlaylist
