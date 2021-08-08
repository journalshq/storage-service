import StorageDatabase from '../database/storage.database'

export default class ContentService {
  database: StorageDatabase
  constructor() {
    this.database = new StorageDatabase()
  }
  public async save(address: string, file: Express.Multer.File) {
    return this.database.save(file.buffer, file.originalname, address)
  }
  public async findAllByAddress(address: string) {
    return this.database.findAllByAddress(address)
  }
}
