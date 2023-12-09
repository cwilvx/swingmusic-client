import { FromOptions, NotifType, playSources } from "@/enums";

import useQueue from "@/stores/queue";
import useAlbum from "@/stores/pages/album";
import useArtist from "@/stores/pages/artist";
import usePlaylist from "@/stores/pages/playlist";
import useSettingsStore from "@/stores/settings";
import useTracklist from "@/stores/queue/tracklist";
import { useNotifStore } from "@/stores/notification";

import { getAlbumTracks } from "@/requests/album";
import { getArtistTracks } from "@/requests/artists";
import { getFiles } from "@/requests/folders";
import { getPlaylist } from "@/requests/playlists";
import { Track } from "@/interfaces";
import { getFavTracks } from "@/requests/favorite";

export async function utilPlayFromArtist(index: number = 0) {
  const queue = useQueue();
  const artist = useArtist();
  const tracklist = useTracklist();

  const settings = useSettingsStore();

  if (artist.tracks.length === 0) return;

  if (artist.info.trackcount <= settings.artist_top_tracks_count) {
    tracklist.setFromArtist(
      artist.info.artisthash,
      artist.info.name,
      artist.tracks
    );
    queue.play();
    return;
  }

  const tracks = await getArtistTracks(artist.info.artisthash);

  tracklist.setFromArtist(artist.info.artisthash, artist.info.name, tracks);
  queue.play(index);
}

export async function playFromAlbumCard(albumhash: string, albumname: string) {
  const queue = useQueue();
  const tracklist = useTracklist();

  const tracks = await getAlbumTracks(albumhash);

  if (tracks.length === 0) {
    useNotifStore().showNotification("Album tracks not found", NotifType.Error);
    return;
  }

  tracklist.setFromAlbum(albumname, albumhash, tracks);
  queue.play();
}

export async function playFromArtistCard(
  artisthash: string,
  artistname: string
) {
  const queue = useQueue();
  const tracklist = useTracklist();
  const tracks = await getArtistTracks(artisthash);

  if (tracks.length === 0) {
    useNotifStore().showNotification(
      "Artist tracks not found",
      NotifType.Error
    );
    return;
  }

  tracklist.setFromArtist(artisthash, artistname, tracks);
  queue.play();
}

export async function playFromFolderCard(folderpath: string) {
  const queue = useQueue();
  const tracklist = useTracklist();

  const data = await getFiles(folderpath, true);
  const tracks = data.tracks;

  if (tracks.length === 0) {
    useNotifStore().showNotification(
      "Folder tracks not found",
      NotifType.Error
    );
    return;
  }

  tracklist.setFromFolder(folderpath, tracks);
  queue.play();
}

export async function playFromFavorites(track: Track | undefined) {
  const queue = useQueue();
  const tracklist = useTracklist();

  if (tracklist.from.type !== FromOptions.favorite) {
    const tracks = await getFavTracks(0);
    tracklist.setFromFav(tracks);
  }

  const index = tracklist.tracklist.findIndex(
    (t) => t.trackhash === track?.trackhash
  );
  queue.play(index);
}

export async function playFromPlaylist(id: string, track?: Track) {
  const queue = useQueue();
  const tracklist = useTracklist();
  const data = await getPlaylist(id);

  if (!data) return;

  const { tracks, info } = data;

  tracklist.setFromPlaylist(info.name, info.id, tracks);

  if (track) {
    const index = tracks.findIndex((t) => t.trackhash === track.trackhash);
    queue.play(index);
  } else {
    queue.play();
  }
}

export const playFrom = async (source: playSources) => {
  const queue = useQueue();
  const tracklist = useTracklist();

  switch (source) {
    case playSources.album: {
      const album = useAlbum();

      tracklist.setFromAlbum(
        album.info.title,
        album.info.albumhash,
        album.srcTracks
      );
      queue.play();
      break;
    }

    case playSources.playlist: {
      const playlist = usePlaylist();

      if (playlist.tracks.length === 0) return;

      tracklist.setFromPlaylist(
        playlist.info.name,
        playlist.info.id,
        playlist.tracks
      );
      queue.play();
      break;
    }

    case playSources.artist:
      utilPlayFromArtist(0);
  }
};
