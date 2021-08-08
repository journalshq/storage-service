import { Express, Request, Response } from 'express'

import MetadataService from '../service/metadata.service'
import ContentService from '../service/content.service'
import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage() })

const metadataService = new MetadataService()
const contentService = new ContentService()

export default class FileController {
  constructor(app: Express) {
    const basePath = '/api'
    app.get(`${basePath}/accounts/:address/files/:cid`, this.getFileByCid)
    app.post(
      `${basePath}/accounts/:address/files`,
      upload.single('file'),
      this.save
    )
    app.get(`${basePath}/files/:cid/metadata`, this.getMetadata)
    app.get(`${basePath}/accounts/:address/files`, this.findAllByAddress)
  }

  public getFileByCid(req: Request, res: Response): void {
    const cid = req.params.cid
    // res.sendFile(path.resolve('public/uploads/', cid))
  }

  public async save(req: Request, res: Response) {
    try {
      const { address } = req.params
      const response = await contentService.save(address, req.file)
      res.status(200).send({ data: response })
    } catch (error) {
      console.error(error)
      res.status(500).send()
    }
  }

  public async getMetadata(req: Request, res: Response) {
    try {
      const { address, cid } = req.params

      const metadata = await metadataService.extract(cid)
      res.status(200).send({ data: metadata })
    } catch (error) {
      res.status(500).send()
    }
  }

  public async findAllByAddress(req: Request, res: Response) {
    try {
      const { address } = req.params
      const list = await contentService.findAllByAddress(address)
      res.status(200).send({ data: list })
    } catch (error) {
      console.error(error)
      res.status(500).send()
    }
  }
}
