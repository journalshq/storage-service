import StorageDatabase from '../database/storage.database'
import { generateUUID } from '../utils/uuid.utils'
import path from 'path'
import * as fs from 'fs'
import ImageService from './image.service'
import util from 'util'
import { getFileExtension } from '../utils/string.utils'

const writeFile = util.promisify(fs.writeFile)
const unlink = util.promisify(fs.unlink)
const rmdir = util.promisify(fs.rmdir)
const exists = util.promisify(fs.exists)

const IMAGE_FORMATS = ['gif', 'jpeg', 'jpg', 'png']
const VIDEO_FORMATS = ['mp4', 'mov', 'mkv']

export default class StorageService {
  database: StorageDatabase
  metadataService: ImageService
  constructor() {
    this.database = new StorageDatabase()
    this.metadataService = new ImageService()
  }
  public async save(address: string, file: Express.Multer.File) {
    const uuid = generateUUID()
    const extension = getFileExtension(file.originalname)
    const dir = path.resolve('public/uploads/', uuid)
    const pathToOriginal = `${dir}/original.${extension}`
    let thumbnailTargets = [pathToOriginal]

    // 1. Setup folder for new event
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    // 2. Save original file to folder as original.extension
    await writeFile(pathToOriginal, file.buffer)

    // 3. Generate 3 TEMP thumbnail images for video
    if (VIDEO_FORMATS.includes(extension)) {
      await this.metadataService.setVideoThumbnail(pathToOriginal, dir)
    }

    // 4. Generate official thumbnail
    await this.metadataService.createThumbnail(
      dir,
      VIDEO_FORMATS.includes(extension)
    )

    // 5. OPTIONAL: remove temp-file if video
    const hasTempFile = await exists(`${dir}/temp.png`)
    if (hasTempFile) {
      await unlink(`${dir}/temp.png`)
    }

    // 6. Upload folder with thumbnail and content
    await this.database.saveAll(dir, uuid, address)

    // 7. Clean up local folder after Textile upload
    await rmdir(dir, { recursive: true })

    return uuid
  }
  public async remove(address: string, fileName: string) {
    return this.database.remove(address, fileName)
  }
  public async findAllByAddress(address: string) {
    // Will retrieve root IPFS if no subPath is given
    return this.database.findOne(address)
  }
  public async findByAddressAndEventId(address: string, eventId: string) {
    return this.database.findOne(address, eventId)
  }
  public async getByIpfsPath(ipfsPath: string) {
    return this.database.getByIpfsPath(ipfsPath)
  }
}
