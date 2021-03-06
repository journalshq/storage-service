import * as bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import * as express from 'express'
import logger from 'morgan'
import * as path from 'path'
import cors from 'cors'
import { StorageController } from '../controllers/storage.controller'

import { DB, MODELS_DIR } from '../var/config'
import { globFiles } from '../helpers'
import connect from '../database'

const app: express.Express = express.default()

for (const model of globFiles(MODELS_DIR)) {
  require(path.resolve(model))
}

DB && connect(DB)

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())

new StorageController(app)

export default app
