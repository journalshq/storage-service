import { ExifTool } from 'exiftool-vendored'
import fs from 'fs'
import path from 'path'
import util from 'util'
import sharp from 'sharp'

import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import ffprobePath from '@ffprobe-installer/ffprobe'
import ffmpeg from 'fluent-ffmpeg'
import { downloadFile } from '../helpers'

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
ffmpeg.setFfmpegPath(ffmpegPath.path)
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
ffmpeg.setFfprobePath(ffprobePath.path)

const unlink = util.promisify(fs.unlink)
const readFile = util.promisify(fs.readFile)
const readdir = util.promisify(fs.readdir)

const exiftool = new ExifTool({ ignoreShebang: true })

export default class ImageService {
  public async extract(fileUrl: string, name: string) {
    const uploadPath = path.resolve('public/uploads/', name)
    await downloadFile(fileUrl, uploadPath)
    const data = await exiftool.read(uploadPath)
    await unlink(uploadPath)
    return {
      duration: data?.Duration,
      name: data?.FileName,
      gps: {
        longitude: data.GPSLongitude,
        altitude: data?.GPSAltitude,
        latitude: data?.GPSLatitude,
      },
      type: data?.FileType,
      extension: data?.FileTypeExtension,
      dataSize: data?.FileTypeExtension,
      dateCreated: data?.CreateDate?.toString(),
      width: data?.ImageWidth,
      height: data?.ImageHeight,
    }
  }
  public async setVideoThumbnail(filePath: string, thumbnailPath: string) {
    return new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .takeScreenshots(
          {
            count: 3,
            timemarks: ['0%', '25%', '50%', '75%'],
            filename: 'thumbnail-%s.png',
          },
          thumbnailPath
        )
        .on('end', () => {
          resolve(null)
        })
        .on('error', (err) => {
          if (err) reject(err)
          resolve(null)
        })
    })
  }
  public async setGPS(filePath: string) {
    await exiftool.write(filePath, {
      GPSLatitude: 50.84827,
      GPSLongitude: 4.34603,
    })
  }
  public async createThumbnail(directory: string, isVideo: boolean) {
    let files = await readdir(directory)

    if (isVideo) {
      files = files.filter((item: string) => !item.startsWith('original'))
    }

    for (const file of files) {
      const filePath = `${directory}/${file}`
      const buffer = await readFile(filePath)
      await sharp(buffer)
        .resize(960, 540, {
          kernel: sharp.kernel.nearest,
          fit: 'contain',
          background: { r: 75, g: 75, b: 75 },
        })
        .toFile(filePath)
    }
  }
}
