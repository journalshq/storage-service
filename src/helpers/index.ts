import { sync } from 'glob'
import { union } from 'lodash'
import * as stream from 'stream'
import { promisify } from 'util'
import { createWriteStream } from 'fs'
import axios from 'axios'

export const globFiles = (location: string): string[] => {
  return union([], sync(location))
}

const finished = promisify(stream.finished)

export async function downloadFile(
  fileUrl: string,
  outputLocationPath: string
): Promise<any> {
  const writer = createWriteStream(outputLocationPath)
  const { data } = await axios.get(fileUrl, {
    responseType: 'stream',
  })
  data.pipe(writer)
  return finished(writer)
}
