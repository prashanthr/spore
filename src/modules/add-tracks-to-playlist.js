import { isEmpty, chunk } from 'lodash'
import _debug from 'debug'
const debug = _debug('spore:module:add-tracks-to-playlist')

const addTracksToPlaylist = async ({ destinationPlaylistName, trackIds, spore, replaceTracks = false }) => {
  const destinationPlaylistId = spore.user.playlists.name[destinationPlaylistName].id
  debug(`Adding ${trackIds.length} track(s) to ${destinationPlaylistName} (${destinationPlaylistId})`)
  if (!spore.user || !spore.user.playlists || isEmpty(spore.user.playlists)) {
    debug('No playlists cached. Exiting...')
    return
  }
  // 100 limit - https://developer.spotify.com/documentation/web-api/reference/playlists/add-tracks-to-playlist/
  const trackGroups = chunk(trackIds, 100) 
  for (const group of trackGroups) {
    const addResult = replaceTracks 
    ? await spore.replaceTracks(
        destinationPlaylistId,
        group
      )
    : await spore.addTracksToPlaylist(
        destinationPlaylistId,
        group
      )
    debug('Add/Replace Result: ', addResult)
  }
}

export default addTracksToPlaylist
