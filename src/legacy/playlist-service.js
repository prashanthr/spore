// @flow
import SpotifyBaseService from './spotify'
import _debug from 'debug'
var debug = _debug('spotify-playlist-service')

export default class PlaylistService extends SpotifyBaseService {
  async create (
    username,
    name,
    publicFlag, 
    collaborative = false) {
      try {
        const response = await this.spotify.createPlaylist(
          username, 
          name, 
          { public: publicFlag && true }
        )
        debug('RES', response)
        return this.parseResponse(response)
      } catch (err) {
        debug(`Error creating playlist ${err}`)
        return err
      }
      
  }

  async update (
    username, 
    playlistId,
    name,
    publicFlag, 
    collaborative = false) {
      try {
        const response = await this.spotify.changePlaylistDetails(
          username,
          playlistId,
          name,
          { public: publicFlag && false },
          { collaborative }
        )
        return this.parseResponse(response)
      } catch (err) {
        debug(`Error updating playlist ${err}`)
        return err
      }
  }

  async addTracks (
    username, 
    playlistId, 
    trackUris, 
    position) {
    try {
      const response = await this.spotify.addTracksToPlaylist(
        username,
        playlistId,
        trackUris,
        postion ? { postion } : {}
      )
      return this.parseResponse(response)
    } catch (err) {
      debug(`Error adding tracks to playlist ${err}`)
      return err
    }
  }
  
  /**
   * 
   * 
   * @param {string} username 
   * @param {string} playlistId 
   * @param {[]} tracks [{ uri: "spotify:track:902u4lk" }]
   * @memberof PlaylistService
   */
  async removeTracks (username, playlistId, tracks = [], options = {}) {
    try {
      const response = await this.spotify.removeTracksFromPlaylist(
        username,
        playlistId,
        tracks,
        options
      )
    } catch (err) {
      debug(`Error removing tracks from playlist ${err}`)
      return err
    }
  }

  async getAll (username, options) {
    try {
      //await this.flow()
      const response = await this.spotify.getUserPlaylists(username, options)
      return this.parseResponse(response)
    } catch (err) {
      debug(`Error getting all playlists for ${username}. ${err}`)
      return err
    }
  }

  async get (username, playlistId) {
    try {
      const response = await this.spotify.getPlaylist(username, playlistId)
      return this.parseResponse(response)
    } catch (err) {
      debug(`Error getting playlist ${playlistId}. ${err}`)
      return err
    }
  }

  async search (query, types) {
    try {
      const response = await this.spotify.search(query, types)
      debug('Search results', response)
      return response
    } catch (err) {
      debug('Error searching', err)
      throw err
    }
  }

  async flow (authRequired = false) {
    if (authRequired) {
      await this.authFlow()
      return
    }
    if (this.isInitialized) {
      await this.refresh()
    } else {
      await this.initialize()
    }
  }
}