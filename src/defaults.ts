import { readFileSync } from 'fs'
import { resolve } from 'path'

export const BUILTIN_QR_NAME = '内置二维码'
export const BUILTIN_QR_FILE = resolve(__dirname, '../assets/builtin-qr.png')
export const BUILTIN_QR_IMAGE = `data:image/png;base64,${readFileSync(BUILTIN_QR_FILE).toString('base64')}`