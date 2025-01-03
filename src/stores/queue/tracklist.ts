import { defineStore } from 'pinia'

import useInterface from '@/stores/interface'
import { NotifType, useToast } from '@/stores/notification'
import { usePlayer } from '@/stores/player'
import useQueue from '@/stores/queue'
import useSettings from '@/stores/settings'

import { FromOptions } from '@/enums'
import {
    fromAlbum,
    fromArtist,
    fromFav,
    fromFolder,
    fromMix,
    fromPlaylist,
    fromSearch,
    Track,
} from '@/interfaces'

export type From =
    | fromFolder
    | fromAlbum
    | fromPlaylist
    | fromSearch
    | fromArtist
    | fromFav
    | fromMix

function shuffle(tracks: Track[]) {
    const shuffled = tracks.slice()
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}
export default defineStore('tracklist', {
    state: () => ({
        from: {} as From,
        tracklist: <Track[]>[],
    }),
    actions: {
        loadFromLocalStorage() {
            const queue = localStorage.getItem('queue')

            if (queue) {
                const parsed = JSON.parse(queue)
                this.from = parsed.from
                this.tracklist = parsed.tracks
            }
        },
        setNewList(tracklist: Track[]) {
            if (this.tracklist !== tracklist) {
                this.tracklist = []
                this.tracklist.push(...tracklist)
            }

            const settings = useSettings()

            if (settings.repeat_one) {
                settings.toggleRepeatMode()
            }

            const { focusCurrentInSidebar } = useInterface()
            focusCurrentInSidebar(1000)
            usePlayer().clearNextAudio()
        },
        setFromFolder(path: string, tracks: Track[]) {
            // remove trailing slash
            path = path.replace(/\/$/, '')
            const name = path.split('/').pop()
            this.from = <fromFolder>{
                type: FromOptions.folder,
                path: tracks[0].folder,
                name: name?.trim() === '' ? path : name,
            }
            this.setNewList(tracks)
        },
        setFromAlbum(name: string, albumhash: string, tracks: Track[]) {
            this.from = <fromAlbum>{
                type: FromOptions.album,
                name: name,
                albumhash: albumhash,
            }

            this.setNewList(tracks)
        },
        setFromPlaylist(name: string, pid: number, tracks: Track[]) {
            this.from = <fromPlaylist>{
                type: FromOptions.playlist,
                name: name,
                id: pid,
            }

            this.setNewList(tracks)
        },
        setFromMix(name: string, id: string, tracks: Track[], sourcehash: string, image: { type: 'mix' | 'track', image: string }) {
            this.from = <fromMix>{
                type: FromOptions.mix,
                name: name,
                mixid: id,
                sourcehash,
                image,
            }

            this.setNewList(tracks)
        },
        setFromSearch(query: string, tracks: Track[]) {
            this.from = <fromSearch>{
                type: FromOptions.search,
                query: query,
            }

            this.setNewList(tracks)
        },
        setFromArtist(artisthash: string, name: string, tracks: Track[]) {
            this.from = <fromArtist>{
                type: FromOptions.artist,
                artisthash: artisthash,
                artistname: name,
            }

            this.setNewList(tracks)
        },
        setFromFav(tracks: Track[]) {
            this.from = <fromFav>{
                type: FromOptions.favorite,
            }

            this.setNewList(tracks)
        },
        addTrack(track: Track) {
            return this.addTracks([track])
        },
        addTracks(tracks: Track[]) {
            this.insertAt(tracks, this.tracklist.length)

            const Toast = useToast()
            Toast.showNotification(
                `Added ${tracks.length} tracks to queue`,
                NotifType.Success
            )
        },
        insertAt(tracks: Track[], index: number) {
            this.tracklist.splice(index, 0, ...tracks)

            const player = usePlayer()
            const queue = useQueue()

            if (index == queue.nextindex) {
                player.clearNextAudio()
            }
        },
        clearList() {
            this.tracklist = []
            this.from = {} as From
        },
        shuffleList() {
            this.tracklist = shuffle(this.tracklist)
        },
        shuffleListIfAutoShuffle() {
            const settings = useSettings()
            if (settings.auto_shuffle) {
                this.shuffleList()
            }
        },
        removeByIndex(index: number) {
            const {
                currentindex,
                nextindex,
                playing,
                playNext,
                moveForward,
                setCurrentIndex,
            } = useQueue()
            const player = usePlayer()

            if (this.tracklist.length == 1) {
                return this.clearList()
            }

            if (index == currentindex) {
                if (playing) {
                    playNext()
                } else {
                    moveForward()
                }

                setCurrentIndex(index)
            }

            if (index < currentindex) {
                setCurrentIndex(currentindex - 1)
            }

            this.tracklist.splice(index, 1)

            if (index == nextindex) {
                player.clearNextAudio()
            }
        },
        toggleFav(index: number) {
            const track = this.tracklist[index]

            if (track) {
                track.is_favorite = !track.is_favorite
            }
        },
        insertAfterCurrent(tracks: Track[]) {
            const { currentindex } = useQueue()

            this.tracklist.splice(currentindex + 1, 0, ...tracks)

            const Toast = useToast()
            Toast.showNotification(
                `Added ${tracks.length} tracks to queue`,
                NotifType.Success
            )
        },
    },
    getters: {
        length(): number {
            return this.tracklist.length
        },
    },
    persist: true,
})
