import io from 'socket.io-client'
import { URLS } from './utils/contants'

export const socket = io(URLS.server)