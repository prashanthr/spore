import { isEmpty } from 'lodash'
import getTrackIds from './get-trackIds-from-playlist'
import _debug from 'debug'
import addTracksToPlaylist from './add-tracks-to-playlist'
const debug = _debug('spore:module:copy-playlist')

/**
 * 
 * @param {*} sourcePlaylistName The source playlist name
 * @param {*} destinationPlaylistName The destination playlist name
 * @param {*} spore The spore object with cached playlist data
 */
const copyPlaylist = async ({ 
  sourcePlaylistName, 
  destinationPlaylistName
  spore
}) => {
  debug(`
    Adding tracks
    from ${sourcePlaylistName} 
    to ${destinationPlaylistName}...
  `)
  
  if (!spore.user || !spore.user.playlists || isEmpty(spore.user.playlists)) {
    debug('No playlists cached. Exiting...')
    return
  }

  const trackIds = await getTrackIds({ sourcePlaylistName, spore })
  const addResult = await addTracksToPlaylist({ destinationPlaylistName, trackIds, spore })
}

export default copyPlaylist
