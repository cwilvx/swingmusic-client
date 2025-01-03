import { defineStore } from 'pinia'

import { xxl } from '@/composables/useBreakpoints'
import { DBSettings, contextChildrenShowMode } from '@/enums'
import { pluginSetActive, updatePluginSettings } from '@/requests/plugins'

import { updateConfig } from '@/requests/settings'
import { usePlayer } from '@/stores/player'
import { content_width } from '../content-width'
import { getLastFmApiSig } from '@/context_menus/hashing'
import useAxios from '@/requests/useAxios'
import { paths } from '@/config'

export default defineStore('settings', {
    state: () => ({
        version: '',
        extend_width: false,
        contextChildrenShowMode: contextChildrenShowMode.hover,
        artist_top_tracks_count: 5,
        repeat_all: true,
        repeat_one: false,
        root_dir_set: false,
        root_dirs: <string[]>[],

        enablePeriodicScans: false,
        periodicInterval: 0,
        enableWatchDog: false,

        folder_list_mode: false,
        volume: 1.0,
        mute: false,

        feat: true,
        prodby: true,
        clean_titles: true,
        hide_remaster: true,
        merge_albums: false,
        show_albums_as_singles: false,
        separators: <string[]>[],

        // client
        useCircularArtistImg: true,
        nowPlayingTrackOnTabTitle: true,
        streaming_quality: 'original',
        streaming_container: 'mp3',

        // plugins
        use_lyrics_plugin: <boolean | undefined>false,
        lyrics_plugin_settings: {
            auto_download: false,
            overide_unsynced: false,
        },
        lasftfm_token: '',
        lastfm_api_key: '',
        lastfm_api_secret: '',
        lastfm_session_key: '',
        lastfm_integration_started: false,

        // audio
        use_silence_skip: true,
        use_crossfade: false,
        crossfade_duration: 2000, // milliseconds
        use_legacy_streaming_endpoint: false,
        auto_shuffle: true,

        // layout
        // INFO: Default to alternate layout from v2.0.0
        layout: 'alternate',
        use_np_img: false,
        use_sidebar: false,

        // stats
        statsgroup: 'artists',
        statsperiod: 'week',
    }),
    actions: {
        mapDbSettings(settings: DBSettings) {
            this.version = settings.version
            this.root_dirs = settings.rootDirs
            this.feat = settings.extractFeaturedArtists
            this.prodby = settings.removeProdBy
            this.clean_titles = settings.cleanAlbumTitle
            this.hide_remaster = settings.removeRemasterInfo
            this.merge_albums = settings.mergeAlbums
            this.separators = settings.artistSeparators
            this.show_albums_as_singles = settings.showAlbumsAsSingles

            this.enablePeriodicScans = settings.enablePeriodicScans
            this.periodicInterval = settings.scanInterval
            this.enableWatchDog = settings.enableWatchDog

            this.lastfm_api_key = settings.lastfmApiKey
            this.lastfm_api_secret = settings.lastfmApiSecret
            this.lastfm_session_key = settings.lastfmSessionKey
            this.use_lyrics_plugin = settings.plugins.find(p => p.name === 'lyrics_finder')?.active

            if (this.use_lyrics_plugin) {
                this.lyrics_plugin_settings = settings.plugins.find(p => p.name === 'lyrics_finder')?.settings
            }
        },
        setArtistSeparators(separators: string[]) {
            this.separators = separators
        },
        // now playing 👇
        toggleUseNPImg() {
            this.use_np_img = !this.use_np_img
        },
        // sidebar 👇
        toggleDisableSidebar() {
            if (this.is_alt_layout) {
                this.use_sidebar = false
                return
            }

            this.use_sidebar = !this.use_sidebar
        },
        toggleExtendWidth() {
            this.extend_width = !this.extend_width
        },
        // context menu 👇
        setContextChildrenShowMode(mode: contextChildrenShowMode) {
            this.contextChildrenShowMode = mode
        },
        toggleContextChildrenShowMode() {
            this.contextChildrenShowMode =
                this.contextChildrenShowMode === contextChildrenShowMode.click
                    ? contextChildrenShowMode.hover
                    : contextChildrenShowMode.click
        },
        // repeat 👇
        toggleRepeatMode() {
            if (this.repeat_all) {
                this.repeat_all = false
                this.repeat_one = true
                return
            }

            if (this.repeat_one) {
                this.repeat_one = false
                this.repeat_all = false
                return
            }

            if (!this.repeat_all && !this.repeat_one) {
                this.repeat_all = true
            }
        },
        setRootDirs(dirs: string[]) {
            this.root_dirs = dirs
        },
        // folders 👇
        toggleFolderListMode() {
            this.folder_list_mode = !this.folder_list_mode
        },
        toggleCleanTrackTitles() {
            this.clean_titles = !this.clean_titles
        },
        toggleShowAlbumAsSingle() {
            this.show_albums_as_singles = !this.show_albums_as_singles
        },
        // volume 👇
        setVolume(new_value: number) {
            const { setVolume } = usePlayer()

            setVolume(new_value)
            this.volume = new_value
        },
        toggleMute() {
            this.mute = !this.mute
            const { setMute } = usePlayer()
            setMute(this.mute)
        },
        initializeVolume() {
            const { setVolume, setMute } = usePlayer()
            setVolume(this.volume)
            setMute(this.mute)
        },
        toggleUseCircularArtistImg() {
            this.useCircularArtistImg = !this.useCircularArtistImg
        },
        toggleLyricsPlugin() {
            pluginSetActive('lyrics_finder', !this.use_lyrics_plugin).then(() => {
                this.use_lyrics_plugin = !this.use_lyrics_plugin
            })
        },
        toggleLyricsAutoDownload() {
            const state = this.lyrics_plugin_settings.auto_download ? false : true

            updatePluginSettings('lyrics_finder', {
                ...this.lyrics_plugin_settings,
                auto_download: state,
            }).then(() => {
                this.lyrics_plugin_settings.auto_download = state
            })
        },
        toggleLyricsOverideUnsynced() {
            const state = this.lyrics_plugin_settings.overide_unsynced ? false : true

            updatePluginSettings('lyrics_finder', {
                ...this.lyrics_plugin_settings,
                overide_unsynced: state,
            }).then(() => {
                this.lyrics_plugin_settings.overide_unsynced = state
            })
        },
        // audio 👇
        toggleUseSilenceSkip() {
            this.use_silence_skip = !this.use_silence_skip
        },
        toggleCrossfade() {
            this.use_crossfade = !this.use_crossfade
        },
        setCrossfadeDuration(duration: number) {
            this.crossfade_duration = duration * 1000
        },

        toggleUseLegacyStreamingEndpoint() {
            this.use_legacy_streaming_endpoint = !this.use_legacy_streaming_endpoint
        },
        toggleAutoShuffle() {
            this.auto_shuffle = !this.auto_shuffle
        },

        // layout 👇
        toggleLayout() {
            if (this.layout == '') {
                this.layout = 'alternate'
                this.use_sidebar = false
                this.use_np_img = false
                return
            }

            this.layout = ''
            this.use_np_img = true
        },

        toggleNowPlayingTrackOnTabTitle() {
            this.nowPlayingTrackOnTabTitle = !this.nowPlayingTrackOnTabTitle
        },

        async genericToggleSetting(key: string, value: any, prop: string) {
            // @ts-expect-error
            const oldValue = this[prop]
            // @ts-expect-error
            this[prop] = value

            const res = await updateConfig(key, value)

            if (res.status !== 200) {
                prop = oldValue
                return false
            }

            return true
        },

        async updatePeriodicInterval(interval: number) {
            return await this.genericToggleSetting('scanInterval', interval, 'periodicInterval')
        },

        async toggleWatchdog() {
            return await this.genericToggleSetting('enableWatchDog', !this.enableWatchDog, 'enableWatchDog')
        },

        async togglePeriodicScans() {
            return await this.genericToggleSetting(
                'enablePeriodicScans',
                !this.enablePeriodicScans,
                'enablePeriodicScans'
            )
        },

        async toggleExtractFeaturedArtists() {
            return await this.genericToggleSetting('extractFeaturedArtists', !this.feat, 'feat')
        },

        async toggleRemoveProdBy() {
            return await this.genericToggleSetting('removeProdBy', !this.prodby, 'prodby')
        },

        async toggleRemoveRemasterInfo() {
            return await this.genericToggleSetting('removeRemasterInfo', !this.hide_remaster, 'hide_remaster')
        },

        async toggleCleanAlbumTitle() {
            return await this.genericToggleSetting('cleanAlbumTitle', !this.clean_titles, 'clean_titles')
        },

        async toggleMergeAlbums() {
            return await this.genericToggleSetting('mergeAlbums', !this.merge_albums, 'merge_albums')
        },

        async toggleShowAlbumsAsSingles() {
            return await this.genericToggleSetting(
                'showAlbumsAsSingles',
                !this.show_albums_as_singles,
                'show_albums_as_singles'
            )
        },
        async setLastfmApiKey(key: string) {
            return await this.genericToggleSetting('lastfmApiKey', key, 'lastfm_api_key')
        },
        async setLastfmApiSecret(key: string) {
            return await this.genericToggleSetting('lastfmApiSecret', key, 'lastfm_api_secret')
        },
        async authorizeLastfmApiKey() {
            const getTokenUrl =
                'http://ws.audioscrobbler.com/2.0/?format=json&method=auth.getToken&api_key=' +
                this.lastfm_api_key +
                '&api_sig=' +
                getLastFmApiSig({ api_key: this.lastfm_api_key }, this.lastfm_api_secret)

            const data = await useAxios(
                {
                    url: getTokenUrl,
                    method: 'POST',
                },
                false
            )
            console.log('res: ', data)

            if (data.status !== 200) {
                return
            }

            this.lasftfm_token = data.data.token
            const url = 'https://www.last.fm/api/auth/?api_key=' + this.lastfm_api_key + '&token=' + this.lasftfm_token
            window.open(url, '_blank')
            this.lastfm_integration_started = true
        },
        async finishLastfmAuth() {
            const res = await useAxios({
                url: paths.api.plugins + '/lastfm/session/create',
                method: 'POST',
                props: {
                    token: this.lasftfm_token,
                },
            })

            console.log('res: ', res)

            if (res.status !== 200) {
                return
            }

            this.lastfm_session_key = res.data.session_key
            this.lastfm_integration_started = false
        },
        async disconnectLastfm() {
            const res = await useAxios({
                url: paths.api.plugins + '/lastfm/session/delete',
                method: 'POST',
            })

            if (res.status !== 200) {
                return
            }

            this.lastfm_session_key = ''
        },
        setStreamingQuality(quality: string) {
            this.streaming_quality = quality
        },
        setStatsGroup(group: string) {
            this.statsgroup = group
        },
        setStatsPeriod(period: string) {
            this.statsperiod = period
        },
    },
    getters: {
        can_extend_width(): boolean {
            return this.is_default_layout && xxl.value
        },
        no_repeat(): boolean {
            return !this.repeat_all && !this.repeat_one
        },
        crossfade_duration_seconds(): number {
            return this.crossfade_duration / 1000
        },
        crossfade_on(): boolean {
            return this.use_crossfade && this.crossfade_duration > 0
        },
        is_default_layout: state => state.layout === '',
        is_alt_layout: state => state.layout === 'alternate' && content_width.value > 900,
    },
    persist: {
        afterRestore: context => {
            let store = context.store
            store.root_dirs = []
            store.root_dir_set = false

            // reset plugin settings
            store.use_lyrics_plugin = false
            store.lyrics_plugin_settings = {}
        },
    },
})
