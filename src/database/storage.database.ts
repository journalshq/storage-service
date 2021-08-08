import { Buckets } from '@textile/hub'
import { Libp2pCryptoIdentity } from '@textile/threads-core'
import { TEXTILE_PUBLIC_KEY, TEXTILE_SECRET } from '../var/config'

export default class StorageDatabase {
  buckets: Buckets

  constructor() {
    this.setup()
  }

  async save(content: Buffer, path: string, bucketName: string) {
    const { bucketKey } = await this.getBucket(bucketName)
    return this.buckets.pushPath(bucketKey, path, content)
  }
  async findByCid(content: string, bucketKey: string) {
    await this.getBucket(bucketKey)
    //return this.buckets.pushPath(bucketKey, 'index.html', file)
  }
  async findAllByAddress(bucketName: string) {
    const { bucketKey } = await this.getBucket(bucketName)
    const { item } = await this.buckets.listPath(bucketKey, '')
    return item
  }
  private async getBucket(bucketKey: string) {
    const bucket = await this.buckets.getOrCreate(bucketKey)
    if (!bucket.root) {
      throw new Error('Failed to open bucket')
    }
    return { bucketKey: bucket.root.key }
  }
  private async setup() {
    const buckets = await Buckets.withKeyInfo({
      key: TEXTILE_PUBLIC_KEY,
      secret: TEXTILE_SECRET,
    })
    const identity = await Libp2pCryptoIdentity.fromRandom()
    await buckets.getToken(identity)
    this.buckets = buckets
  }
}
