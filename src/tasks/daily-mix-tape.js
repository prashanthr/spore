import _debug from 'debug'
import CONSTANTS from '../constants'
import path from 'path' 
import { pick, find, map, filter, flatten } from 'lodash'
import getPlaylists from '../modules/get-playlists'
import getTrackIds from '../modules/get-trackIds-from-playlist'
import addTracksToPlaylist from '../modules/add-tracks-to-playlist'
import removeTracksFromPlaylist from '../modules/remove-tracks-from-playlist'
import { shuffleTracks }  from '../utils/track'

const debug = _debug('spore:task:daily-playlist-merge')

const run = async ({ spore, config }) => {
  try {
    debug(`Running task ${config.taskName}...`)
    const playlists = await getPlaylists({ spore })
    spore.cacheUserData({ playlists })
    const dailyMixPlaylists = filter(playlists, playlist => [
        CONSTANTS.PLAYLISTS.DailyMix1,
        CONSTANTS.PLAYLISTS.DailyMix2,
        CONSTANTS.PLAYLISTS.DailyMix3,
        CONSTANTS.PLAYLISTS.DailyMix4,
        CONSTANTS.PLAYLISTS.DailyMix5,
        CONSTANTS.PLAYLISTS.DailyMix6
      ].includes(playlist.name)
    )
    debug('Daily Mixes', dailyMixPlaylists)
    const dailyMixTrackIdsCollection = []
    for (const playlist of dailyMixPlaylists) {
      dailyMixTrackIdsCollection.push(
        await getTrackIds({ sourcePlaylistName: playlist.name, spore })
      )
    }
    const shuffledTrackIds = shuffleTracks(flatten(dailyMixTrackIdsCollection))
    await removeTracksFromPlaylist({ playlistName: CONSTANTS.PLAYLISTS.DailyMixtape, spore, removeAll: true })
    await addTracksToPlaylist({ 
      destinationPlaylistName: CONSTANTS.PLAYLISTS.DailyMixtape, 
      trackIds: shuffledTrackIds,
      spore
    })
  } catch (err) {
    debug(`Error encountered while running ${config.taskName}`, err)
    throw err
  }
}

export default run
