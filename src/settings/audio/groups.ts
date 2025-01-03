import { Setting } from '@/interfaces/settings'
import settings from '@/stores/settings'
import { SettingType } from '../enums'

// const use_legacy_streaming_endpoint: Setting = {
//     title: 'Use legacy streaming',
//     desc: 'Enable if you experience issues with playback',
//     type: SettingType.binary,
//     state: () => settings().use_legacy_streaming_endpoint,
//     action: () => settings().toggleUseLegacyStreamingEndpoint(),
// }

const use_silence: Setting = {
    title: 'Silence padding removal',
    desc: 'Automatically skip silence between tracks',
    type: SettingType.binary,
    state: () => settings().use_silence_skip,
    action: () => settings().toggleUseSilenceSkip(),
}

const use_crossfade: Setting = {
    title: 'Enable crossfade',
    desc: 'Fade out the current track while fading in the next track',
    type: SettingType.binary,
    state: () => settings().use_crossfade,
    action: () => settings().toggleCrossfade(),
    // @ts-ignore
    experimental: !window.chrome,
}

const crossfade: Setting = {
    title: 'Crossfade duration',
    desc: 'Duration of the crossfade in seconds',
    type: SettingType.locked_number_input,
    state: () => settings().crossfade_duration_seconds,
    action: (duration: number) => settings().setCrossfadeDuration(duration),
    defaultAction: () => {},
    show_if: () => settings().use_crossfade,
}

const auto_shuffle: Setting = {
    title: 'Auto shuffle tracklist',
    desc: 'Shuffle tracklist before start playing Playlist / Artist / Album',
    type: SettingType.binary,
    state: () => settings().auto_shuffle,
    action: () => settings().toggleAutoShuffle(),
}

// const streaming_quality_options = [
//     {
//         title: 'Original',
//         key: 'original',
//     },
//     // {
//     //     title: 'High (1024kbps) (FLAC)',
//     //     key: '1024',
//     // },
//     // {
//     //     title: 'Medium (640kbps) (FLAC)',
//     //     key: '640',
//     // },
//     {
//         title: '320kbps',
//         key: '320',
//     },
//     {
//         title: '128kbps',
//         key: '128',
//     },
//     {
//         title: '96kbps',
//         key: '96',
//     },
// ]

// const transcoding: Setting = {
//     title: 'Streaming quality',
//     desc: 'Choose the streaming quality of the music',
//     type: SettingType.streaming_quality,
//     state: () => streaming_quality_options.find(option => option.key === settings().streaming_quality),
//     action: (quality: {
//         key: string
//         title: string
//     }) => settings().setStreamingQuality(quality.key),
//     defaultAction: () => {},
//     show_if: () => !settings().use_legacy_streaming_endpoint,
//     options: streaming_quality_options as any,
// }

export default [use_silence, use_crossfade, crossfade, auto_shuffle]
