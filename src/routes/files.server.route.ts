import { Express } from 'express'
import { fileController } from '../controllers/files.server.controller'
import { upload } from '../middleware/storage'

export default class FilesRoute {
  constructor(app: Express) {
    const basePath = '/api/files'
    app.get(`${basePath}/:cid`, fileController.getFileByCid)
    app.post(basePath, upload.single('file'), fileController.save)
    app.get(`${basePath}/:cid/metadata`, fileController.getMetadata)
  }
}
