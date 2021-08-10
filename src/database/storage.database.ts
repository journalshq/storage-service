import { Buckets } from '@textile/hub'
import { Libp2pCryptoIdentity } from '@textile/threads-core'
import { TEXTILE_PUBLIC_KEY, TEXTILE_SECRET } from '../var/config'
import * as fs from 'fs'
import path from 'path'
import util from 'util'

const readdir = util.promisify(fs.readdir)

export default class StorageDatabase {
  async save(content: Buffer, pathName: string, bucketName: string) {
    const { bucketKey, buckets } = await this.getBucket(bucketName)
    return buckets.pushPath(bucketKey, pathName, content)
  }

  async saveAll(directory: string, pathName: string, bucketName: string) {
    const { bucketKey, buckets } = await this.getBucket(bucketName)

    const files = await readdir(directory)
    if (files.length === 0) {
      throw Error(`No files found: ${directory}`)
    }

    for (const file of files) {
      const stream = fs.createReadStream(path.join(directory, file), {
        highWaterMark: 1024,
      })
      await buckets.pushPath(bucketKey, `${pathName}/${file}`, stream)
    }
  }
  async remove(bucketName: string, pathName: string) {
    const { bucketKey, buckets } = await this.getBucket(bucketName)
    return buckets.removePath(bucketKey, pathName)
  }
  async getByIpfsPath(ipfsPath: string) {
    const { buckets } = await this.getBucket()
    return buckets.listIpfsPath(ipfsPath)
  }
  async findOne(bucketName: string, pathName?: string) {
    const { bucketKey, buckets } = await this.getBucket(bucketName)
    const { item } = await buckets.listPath(bucketKey, pathName || '')
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
