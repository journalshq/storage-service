import { Request, Response } from 'express'

import { ExifTool } from 'exiftool-vendored'
import path from 'path'
const exiftool = new ExifTool({ ignoreShebang: true })

interface MulterRequest extends Request {
  file: any
}

export default class FileController {
  public getFileByCid(req: Request, res: Response): void {
    const cid = req.params.cid
    res.sendFile(path.resolve('public/uploads/', cid))
  }

  public save(req: MulterRequest, res: Response): void {
    // const cid = await client.put([new File([data.buffer], 'hello.json')])
    res.status(200).send({ data: { cid: req.file.filename } })
  }

  public async getMetadata(req: MulterRequest, res: Response) {
    try {
      const filePath = path.resolve('public/uploads/', req.params.cid)
      const data = await exiftool.read(filePath)
      const metadata = {
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
      res.status(200).send({ data: metadata })
    } catch (error) {
      console.error(error)
    }
  }
}

export const fileController = new FileController()
