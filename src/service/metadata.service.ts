import { ExifTool } from 'exiftool-vendored'

const exiftool = new ExifTool({ ignoreShebang: true })

export default class MetadataService {
  public async extract(filePath: string) {
    try {
      const data = await exiftool.read(filePath)
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
    } catch (error) {
      console.error(error)
    }
  }
}
