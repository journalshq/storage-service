import { Express, Request, Response } from 'express'

import MetadataService from '../service/metadata.service'
import ContentService from '../service/content.service'
import multer from 'multer'
import { downloadFile } from '../helpers'
import { CONTENT_URI } from '../var/config'

const upload = multer({ storage: multer.memoryStorage() })

const metadataService = new MetadataService()
const contentService = new ContentService()

export default class FileController {
  constructor(app: Express) {
    const basePath = '/api'
    app.get(`${basePath}/files`, this.getFileByIpfsPath)
    app.post(
      `${basePath}/accounts/:address/files`,
      upload.single('file'),
      this.save
    )
    app.get(`${basePath}/accounts/:address/files`, this.findAllByAddress)
    app.get(`${basePath}/accounts/:address/files/:cid`, this.findAllByAddress)
    app.get(`${basePath}/files/metadata`, this.getMetadata)
  }

  public async getFileByIpfsPath(req: Request, res: Response) {
    try {
      const ipfsPath = (req.query.ipfsPath as string) || ''
      const data = await contentService.getByIpfsPath(ipfsPath)
      console.log(data)
      res.status(200).send({ data })
    } catch (error) {
      console.log(error)
      res.status(500).send()
    }
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
      const ipfsPath = (req.query.ipfsPath as string) || ''
      const data = await contentService.getByIpfsPath(ipfsPath)
      // TODO: Verify cid belongs to address

      const metadata = await metadataService.extract(
        `${CONTENT_URI}/${data?.cid}`,
        data?.name
      )
      res.status(200).send({ data: metadata })
    } catch (error) {
      console.error(error)
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
