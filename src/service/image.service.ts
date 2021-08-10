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
            count: 1,
            timemarks: ['0'],
            filename: 'temp.png',
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
  public async createThumbnail(filePath: string, thumbnailPath: string) {
    const buffer = await readFile(filePath)

    await sharp(buffer)
      .resize(1280, 720, {
        kernel: sharp.kernel.nearest,
        fit: 'contain',
        background: { r: 75, g: 75, b: 75 },
      })
      .toFile(thumbnailPath)
  }
}
