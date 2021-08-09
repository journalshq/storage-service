import { ExifTool } from 'exiftool-vendored'
import fs from 'fs'
import path from 'path'
import util from 'util'
import { downloadFile } from '../helpers'

const unlink = util.promisify(fs.unlink)

const exiftool = new ExifTool({ ignoreShebang: true })

export default class MetadataService {
  public async extract(fileUrl: string, name: string) {
    const uploadPath = path.resolve('public/uploads/', name)
    await downloadFile(fileUrl, uploadPath)
    const data = await exiftool.read(uploadPath)
    await unlink(uploadPath)
    return {
      duration: data?.Duration,
      name: data?.FileName,
      gps: {
        longitude: data.GPSLatitude,
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
}
