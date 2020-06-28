import { shuffle } from 'lodash'
export const shuffleTracks = (trackIds) => {
  return shuffle(trackIds)
}