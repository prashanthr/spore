import axios from 'axios'
import _debug from 'debug'
const debug = _debug('spore:utils:health-check')

const HealthCheckUrlMap = {
  'save-discover-weekly-tracks': 'https://hc-ping.com/9747c5e3-85aa-4a95-aa72-2f4be66af10d',
  'daily-mix-tape': 'https://hc-ping.com/aece41aa-bd04-43d8-9c0e-da19e36a0aea',
}

const healthCheck = async (task, failed = false) => {
  const url = HealthCheckUrlMap[task]
  if (url) {
    try {
      debug(`Performing health check for ${task} [Failed: ${failed}]`)
      await axios.get(`${url}${failed ? '/fail' : ''}`)
    } catch (err) {
      debug(`Error performing health check for ${task}: ${err}`)
    }
  }
}

export default healthCheck
