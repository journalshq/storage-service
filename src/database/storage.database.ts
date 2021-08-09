import { Buckets, PathItem } from '@textile/hub'
import { Libp2pCryptoIdentity } from '@textile/threads-core'
import { TEXTILE_PUBLIC_KEY, TEXTILE_SECRET } from '../var/config'
import axios from 'axios'

export default class StorageDatabase {
  async save(content: Buffer, path: string, bucketName: string) {
    const { bucketKey, buckets } = await this.getBucket(bucketName)
    return buckets.pushPath(bucketKey, path, content)
  }
  async findByCid(cid: string) {
    const { data } = await axios({
      url: `https://ipfs.io/ipfs/${cid}`,
      responseType: 'stream',
    })
    return data
  }
  async getByIpfsPath(ipfsPath: string) {
    const { buckets } = await this.getBucket()
    return buckets.listIpfsPath(ipfsPath)
  }
  async findAllByAddress(bucketName: string) {
    const { bucketKey, buckets } = await this.getBucket(bucketName)
    const { item } = await buckets.listPath(bucketKey, '')
    const index = item?.items?.findIndex(
      (pathItem) => pathItem?.name === '.textileseed'
    )
    if (index > -1) {
      item.items.splice(index, 1)
    }
    return item
  }
  private async getBucket(bucketKey?: string) {
    const buckets = await Buckets.withKeyInfo({
      key: TEXTILE_PUBLIC_KEY,
      secret: TEXTILE_SECRET,
    })
    const identity = await Libp2pCryptoIdentity.fromRandom()
    await buckets.getToken(identity)
    let bucket
    if (bucketKey) {
      bucket = await buckets.getOrCreate(bucketKey)
      if (!bucket.root) {
        throw new Error('Failed to open bucket')
      }
    }
    return { buckets, bucketKey: bucket?.root?.key }
  }
}
