import { Express, Request, Response } from 'express'

import StorageService from '../service/storage.service'
import multer from 'multer'
import { CONTENT_URI } from '../var/config'
import ImageService from '../service/image.service'
import path from 'path'

const upload = multer({ storage: multer.memoryStorage() })

const contentService = new StorageService()
const imageService = new ImageService()

export class StorageController {
  constructor(app: Express) {
    const basePath = '/api'
    app.post(
      `${basePath}/accounts/:address/events`,
      upload.single('file'),
      this.save
    )
    app.get(`${basePath}/accounts/:address/events`, this.findAllByAddress)
    app.get(`${basePath}/accounts/:address/events/:eventId`, this.findOne)
    app.get(
      `${basePath}/accounts/:address/events/:eventId/metadata`,
      this.getMetadata
    )
    app.delete(`${basePath}/accounts/:address/events/:eventId`, this.remove)
  }

  public async findOne(req: Request, res: Response) {
    try {
      const { address, eventId } = req.params
      const data = await contentService.findByAddressAndEventId(
        address,
        eventId
      )
      res.status(200).send({ data })
    } catch (error) {
      console.log(error)
      res.status(500).send()
    }
  }

  public async save(req: Request, res: Response) {
    try {
      const { address } = req.params
      const eventId = await contentService.save(address, req.file)
      res.status(200).send({ data: { eventId } })
    } catch (error) {
      console.error(error)
      res.status(500).send()
    }
  }

  public async remove(req: Request, res: Response) {
    try {
      const { address, eventId } = req.params
      const response = await contentService.remove(address, eventId)
      res.status(200).send({ data: response })
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

  public async getMetadata(req: Request, res: Response) {
    try {
      const { address, eventId } = req.params
      const data = await contentService.findByAddressAndEventId(
        address,
        eventId
      )
      const original = data?.items[0]
      const metadata = await imageService.extract(
        `${CONTENT_URI}/${original?.cid}`,
        original?.name
      )
      res.status(200).send({ data: metadata })
    } catch (error) {
      console.error(error)
      res.status(500).send()
    }
  }
}
