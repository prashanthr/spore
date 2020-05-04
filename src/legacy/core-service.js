import SpotifyBaseService from './spotify'
// import SearchService from './services/search-service'
// import FeatureService from './services/feature-service'
// import AnalysisService from './services/analysis-service'
import PlaylistService from './playlist-service'
import { keyBy } from 'lodash'
import _debug from 'debug'
var debug = _debug('spotify')

class Spotify {
  constructor () {
    this.service = new SpotifyBaseService()
    // this.searchService = new SearchService()
    // this.featureService = new FeatureService()
    // this.analysisService = new AnalysisService()
    this.playlistService = new PlaylistService()
    debug('Spotify', this.service.spotify)
  }

  async initialize () {
    await this.service.initialize()
  }
  async refresh () {
    await this.service.refreshToken()
  }

  async flow (authRequired = false) {
    if (authRequired) {
      await this.service.authFlow()
      return
    }
    if (this.service.isInitialized) {
      await this.refresh()
    } else {
      await this.initialize()
    }
  }

  async search (params) {
    await this.flow()
    return await this.searchService
        .search(params.query, params.types, params.options)
  }

  async getFeatures (trackIds) {
    await this.flow()
    const data = await this.featureService
      .getFeatures(trackIds)
    return keyBy(data.audio_features, 'id')
  }

  async analyze (trackId) {
    await this.flow()
    return await this.analysisService.analyze(trackId)
  }

  async listAllPlaylists (username) {
    await this.flow(true)
    return await this.playlistService.getAll(username)
  }

  async createPlaylist ({
    username, 
    name,
    publicFlag, 
    collaborative
  }) {
    await this.flow(true)
    return await this.playlistService.create(username, name, publicFlag, collaborative)
  }

  async updatePlaylist (
    username,
    playlistId,
    name,
    publicFlag,
    collaborative) {
      return await this.playlistService.update(username, playlistId, name, publicFlag, collaborative)
  }

  async addTracksToPlaylist (
    username,
    playlistId,
    trackUris = [],
    position) {
      return await this.playlistService.addTracks(username, playlistId, trackUris, position)
    }
}

export default new Spotify()
