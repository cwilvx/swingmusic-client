import { paths } from '@/config'
import { Album, StatItem, Track } from '@/interfaces'
import { NotifType, useToast } from '@/stores/notification'
import useAxios from './useAxios'

const {
    album: albumUrl,
    albumartists: albumArtistsUrl,
    albumbio: albumBioUrl,
    albumsByArtistUrl,
    albumVersions,
} = paths.api

const getAlbumData = async (albumhash: string, albumlimit: number) => {
    interface AlbumData {
        info: Album
        tracks: Track[]
        copyright: string
        extra: {
            track_total: number
            avg_bitrate: number
        }
        stats: StatItem[]
        more_from: {
            [key: string]: Album[]
        }
        other_versions: Album[]
    }

    const { data, status } = await useAxios({
        url: albumUrl,
        props: {
            albumhash,
            albumlimit,
        },
    })

    if (status == 204) {
        useToast().showNotification('Album not created yet!', NotifType.Error)
    }

    return data as AlbumData
}

const getAlbumArtists = async (hash: string) => {
    const { data, error } = await useAxios({
        url: albumArtistsUrl,
        props: {
            hash: hash,
        },
    })

    if (error) {
        console.error(error)
    }

    return data.artists
}

const getAlbumBio = async (hash: string) => {
    const { data, status } = await useAxios({
        url: albumBioUrl,
        props: {
            hash: hash,
        },
    })

    if (data) {
        return data.bio
    }

    if (status == 404) {
        return null
    }
}

export const getAlbumsFromArtist = async (albumartists: {}, limit: number = 2, base_title: string) => {
    const { data } = await useAxios({
        url: albumsByArtistUrl,
        props: {
            albumartists: albumartists,
            limit: limit,
            base_title,
        },
    })

    if (data) {
        return data
    }

    return []
}

export const getAlbumVersions = async (og_album_title: string, albumhash: string) => {
    const { data } = await useAxios({
        url: albumVersions,
        props: {
            og_album_title,
            albumhash,
        },
    })

    if (data) {
        return data
    }

    return []
}

export async function getAlbumTracks(albumhash: string): Promise<Track[]> {
    const { data } = await useAxios({
        url: albumUrl + `/${albumhash}/` + 'tracks',
        method: 'GET',
    })

    return data
}

export async function getSimilarAlbums(artisthash: string, limit: number = 5): Promise<Album[]> {
    const { data } = await useAxios({
        url: albumUrl + '/similar?' + 'artisthash=' + artisthash + '&albumlimit=' + limit,
        method: 'GET',
    })

    return data
}

export { getAlbumData as getAlbum, getAlbumArtists, getAlbumBio }
