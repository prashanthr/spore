import axios from 'axios'
import _debug from 'debug'
const debug = _debug('spore:utils:health-check')

const HealthCheckUrlMap = {
  'save-discover-weekly-tracks': 'https://hc-ping.com/9747c5e3-85aa-4a95-aa72-2f4be66af10d',
  'daily-mix-tape': 'https://hc-ping.com/aece41aa-bd04-43d8-9c0e-da19e36a0aea',
}

const healthCheck = async ({ 
  task,  
  pingType = 'ping' // 'fail' or 'start'
}) => {
  const getUrlSuffix = (pingType) => {
    switch (pingType) {
      case 'start':
        return '/start'
      case 'fail':
      case 'failure':
        return '/fail'
      case 'ping':
      default:
        return ''
    }
  }
  const url = HealthCheckUrlMap[task]
  if (url) {
    try {
      debug(`Performing health check for ${task} [pingType: ${pingType}]`)
      await axios.get(`${url}${getUrlSuffix(pingType)}`)
    } catch (err) {
      debug(`Error performing health check for ${task}: ${err}`)
    }
  }
}

export default healthCheck
