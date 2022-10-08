import {join, dirname} from 'path'
import {fileURLToPath} from 'url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const root = join(currentDir, '../')
const publicDircetory = join(root, 'public')
const audioDirectory = join(root, 'audio')
const songsDirectory = join(audioDirectory, 'songs')
const fxDirectory = join(audioDirectory, 'fx')

export default {
    port: process.env.PORT || 3000,
    dir: {
        root,
        publicDircetory,
        audioDirectory,
        songsDirectory,
        fxDirectory
    },
    pages: {
        homeHTML: 'home/index.html',
        controller: 'controller/index.html'
    },
    location: {
        home: '/home'
    },
    constants: {
        CONTENT_TYPE: {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript'
        }
    }
}