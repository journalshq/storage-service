import { Buckets } from '@textile/hub'
import { Libp2pCryptoIdentity } from '@textile/threads-core'
import { TEXTILE_PUBLIC_KEY, TEXTILE_SECRET } from '../var/config'

export default class StorageDatabase {
  async save(content: Buffer, path: string, bucketName: string) {
    const { bucketKey, buckets } = await this.getBucket(bucketName)
    return buckets.pushPath(bucketKey, path, content)
  }
  async findByCid(content: string, bucketKey: string) {
    await this.getBucket(bucketKey)
    //return this.buckets.pushPath(bucketKey, 'index.html', file)
  }
  async findAllByAddress(bucketName: string) {
    const { bucketKey, buckets } = await this.getBucket(bucketName)
    const { item } = await buckets.listPath(bucketKey, '')
    return item
  }
  private async getBucket(bucketKey: string) {
    const buckets = await Buckets.withKeyInfo({
      key: TEXTILE_PUBLIC_KEY,
      secret: TEXTILE_SECRET,
    })
    const identity = await Libp2pCryptoIdentity.fromRandom()
    await buckets.getToken(identity)
    const bucket = await buckets.getOrCreate(bucketKey)
    if (!bucket.root) {
      throw new Error('Failed to open bucket')
    }
    return { buckets, bucketKey: bucket.root.key }
  }
}
