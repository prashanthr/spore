import SpotifyWebApi from 'spotify-web-api-node'
import url from 'url'
import querystring from 'querystring'
import { exec } from 'child_process'
import _debug from 'debug'
import { writeToFile } from './utils/file'
import { keyBy, map } from 'lodash'
import CONSTANTS from './constants'
import cuid from 'cuid'
import path from 'path'

const debug = _debug('spore:spore')

class Spore {
  constructor ({ accessToken, refreshToken, clientId, clientSecret, redirectUri = 'http://localhost:3000/callback' }) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.spotify = new SpotifyWebApi({
      clientId,
      clientSecret,
      redirectUri,
      accessToken,
      refreshToken
    })
    this.user = {
      playlists: {
        id: {},
        name: {}
      }
    }
  }

  cacheUserData ({ playlists, tracks, albums, artists }) {
    if (playlists) {
      this.user.playlists = {
        id: {
          ...this.user.playlists.id,
          ...keyBy(playlists, 'id')
        },
        name: {
          ...this.user.playlists.name,
          ...keyBy(playlists, 'name')
        }
      }
    }
  }

  async setToken({ accessToken, refreshToken }) {
    if (accessToken) {
      this.spotify.setAccessToken(accessToken)
      this.accessToken = accessToken
      await writeToFile(accessToken, path.resolve(__dirname, CONSTANTS.FILENAME.SPOTIFY_ACCESS_TOKEN))
    } 

    if (refreshToken) {
      this.spotify.setRefreshToken(refreshToken)
      this.refreshToken = refreshToken
      await writeToFile(refreshToken, path.resolve(__dirname, CONSTANTS.FILENAME.SPOTIFY_REFRESH_TOKEN))
    }
  }

  async getUserAuthUrl (
    scopes = [
      'user-read-private',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-private',
      'playlist-modify-public'
    ], 
    state = cuid()
  ) {
    const authorizeURL = await this.spotify.createAuthorizeURL(scopes, state)
    debug('Auth URL', authorizeURL)
    return authorizeURL
  }

  async launchUserAuthPage (url) {
    const cmd = "./bin/open-browser.sh"
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        debug('Error running child process', stderr, err)
        throw err
      }
      debug(stdout)
    })
  }

  parseAuthCode (rawUrl) {
    let parsedUrl = url.parse(rawUrl)
    let parsedQs = querystring.parse(parsedUrl.query)
    const { code } = parsedQs
    return code
  }
  
  async grantAuthCode (code) {
    const response = await this.spotify.authorizationCodeGrant(code)
    debug('Auth Code Grant', response)
    const { access_token, refresh_token } = response.body
    await this.setToken({
      accessToken: access_token,
      refreshToken: refresh_token
    })
  }

  async refreshAccessToken () {
    try {
      const response = await this.spotify.refreshAccessToken()
      const result = this.parseResponse(response)
      const { access_token, refresh_token } = result
      await this.setToken({
        accessToken: access_token,
        refreshToken: refresh_token
      })
      debug('Successfully refreshed token')
      return true
    } catch (err) {
      debug('Error refreshing token')
      await this.setToken({
        accessToken: null,
        refreshToken: null
      })
      return false
    }
  }

  async testAuth () {
    try {
      const response = await this.spotify.getMe()
      debug('test auth response', response)
      return Boolean(this.parseResponse(response))
    } catch (err) {
      debug('Error in test auth', err)
      return false
    }
  }

  async isAccessTokenExpired () {
    if (!this.accessToken) {
      return true
    }
    return await this.testAuth()
  }
  
  async authFlow (authUrl) {
    if (authUrl) {
      const code = this.parseAuthCode(authUrl)
      await this.grantAuthCode(code)
      return true
    }

    if (this.isAccessTokenExpired()) {
      const isRefreshSuccessful = await this.refreshAccessToken()
      if (isRefreshSuccessful) {
        return true
      }  
      const url = this.getUserAuthUrl()
      this.launchUserAuthPage(url)
      return false
    }
  }

  async getAllPlaylists (username, options) {
    try {
      const response = await this.spotify.getUserPlaylists(username, options)
      return this.parseResponse(response)
    } catch (err) {
      debug(`Error getting all playlists for ${username}. ${err}`)
      return err
    }
  }

  async getPlaylist (playlistId) {
    try {
      const response = await this.spotify.getPlaylist(playlistId)
      return this.parseResponse(response)
    } catch (err) {
      debug(`Error getting playlist ${playlistId}`)
      throw err
    }
  }

  async getAllTracksInPlaylist (playlistId, options) {
    try {
      const response = await this.spotify.getPlaylistTracks(playlistId, options)
      return this.parseResponse(response)
    } catch (err) {
      debug(`Error getting tracks in playlist ${playlistId}`)
      throw err
    }
  }

  async addTracksToPlaylist (playlistId, trackUris = []) {
    try {
      const response = await this.spotify.addTracksToPlaylist(playlistId, trackUris)
      return this.parseResponse(response)
    } catch (err) {
      debug(`Error adding tracks to playlist ${playlistId}`)
      throw err
    }
  }

  async replaceTracksInPlaylist (playlistId, trackUris = []) {
    try {
      const response = await this.spotify.replaceTracksInPlaylist(playlistId, trackUris)
      return this.parseResponse(response)
    } catch (err) {
      debug(`Error replacing tracks in playlist ${playlistId}`)
      throw err
    }
  }

  async removeTracksFromPlaylist (playlistId, trackUris = []) {
    try {
      const response = await this.spotify.removeTracksFromPlaylist(playlistId, map(trackUris, uri => ({ uri })))
      return this.parseResponse(response)
    } catch (err) {
      debug(`Error removing tracks from playlist ${playlistId}`)
      throw err
    }
  }

  parseResponse (response, log = false) {
    if (![200, 201].includes(response.statusCode)) {
      debug('Error in request', response, response.body)
      throw new Error(response.body)
    } else {
      if (log) debug('response', response)
      return response.body
    }
  }

}

export default Spore