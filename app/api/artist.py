"""
Contains all the artist(s) routes.
"""
# import urllib
# import requests
from collections import deque
from flask import Blueprint, request

# from app import cache, instances, utils
from app.db.store import Store
from app.models import Album, Track
from app.utils import remove_duplicates

artist_bp = Blueprint("artist", __name__, url_prefix="/")


class CacheEntry:
    """
    The cache entry class for the artists cache.
    """

    def __init__(
        self, artisthash: str, albumhashes: set[str], tracks: list[Track]
    ) -> None:
        self.albums: list[Album] = []
        self.tracks: list[Track] = []

        self.artisthash: str = artisthash
        self.albumhashes: set[str] = albumhashes

        if len(tracks) > 0:
            self.tracks: list[Track] = tracks

        self.type_checked = False
        self.albums_fetched = False


class ArtistsCache:
    artists: deque[CacheEntry] = deque(maxlen=6)

    @classmethod
    def get_albums_by_artisthash(cls, artisthash: str):
        """
        Returns the cached albums for the given artisthash.
        """
        for (index, albums) in enumerate(cls.artists):
            if albums.artisthash == artisthash:
                return (albums.albums, index)

        return ([], -1)

    @classmethod
    def albums_cached(cls, artisthash: str) -> bool:
        """
        Returns True if the artist is in the cache.
        """
        for entry in cls.artists:
            if entry.artisthash == artisthash and len(entry.albums) > 0:
                return True

        return False

    @classmethod
    def albums_fetched(cls, artisthash: str):
        """
        Checks if the albums have been fetched for the given artisthash.
        """
        for entry in cls.artists:
            if entry.artisthash == artisthash:
                return entry.albums_fetched

    @classmethod
    def tracks_cached(cls, artisthash: str) -> bool:
        """
        Checks if the tracks have been cached for the given artisthash.
        """
        for entry in cls.artists:
            if entry.artisthash == artisthash and len(entry.tracks) > 0:
                return True

        return False

    @classmethod
    def add_entry(cls, artisthash: str, albumhashes: set[str], tracks: list[Track]):
        """
        Adds a new entry to the cache.
        """
        cls.artists.append(CacheEntry(artisthash, albumhashes, tracks))

    @classmethod
    def get_tracks(cls, artisthash: str):
        """
        Returns the cached tracks for the given artisthash.
        """
        entry = [a for a in cls.artists if a.artisthash == artisthash][0]
        return entry.tracks

    @classmethod
    def get_albums(cls, artisthash: str):
        """
        Returns the cached albums for the given artisthash.
        """
        entry = [a for a in cls.artists if a.artisthash == artisthash][0]

        entry.albums = [Store.get_album_by_hash(h) for h in entry.albumhashes]

        store_albums = Store.get_albums_by_artisthash(artisthash)

        all_albums_hash = "-".join([a.albumhash for a in entry.albums])

        for album in store_albums:
            if album.albumhash not in all_albums_hash:
                entry.albums.append(album)

        entry.albums_fetched = True

    @classmethod
    def process_album_type(cls, artisthash: str):
        """
        Checks the cached albums type for the given artisthash.
        """
        entry = [a for a in cls.artists if a.artisthash == artisthash][0]

        for album in entry.albums:
            album.check_type()

            album_tracks = Store.get_tracks_by_albumhash(album.albumhash)
            album_tracks = remove_duplicates(album_tracks)

            album.check_is_single(album_tracks)

        entry.type_checked = True


def add_albums_to_cache(artisthash: str):
    """
    Fetches albums and adds them to the cache.
    """
    tracks = Store.get_tracks_by_artist(artisthash)

    if len(tracks) == 0:
        return False

    albumhashes = set(t.albumhash for t in tracks)
    ArtistsCache.add_entry(artisthash, albumhashes, [])

    return True


@artist_bp.route("/artist/<artisthash>", methods=["GET"])
def get_artist(artisthash: str):
    limit = request.args.get("limit")

    if limit is None:
        limit = 6

    limit = int(limit)

    artist = Store.get_artist_by_hash(artisthash)

    if artist is None:
        return {"error": "Artist not found"}, 404

    tracks_cached = ArtistsCache.tracks_cached(artisthash)

    if tracks_cached:
        tracks = ArtistsCache.get_tracks(artisthash)
    else:
        tracks = Store.get_tracks_by_artist(artisthash)
        albumhashes = set(t.albumhash for t in tracks)

        ArtistsCache.add_entry(artisthash, albumhashes, tracks)

    tcount = len(tracks)
    acount = Store.count_albums_by_artisthash(artisthash)

    if acount == 0 and tcount < 10:
        limit = tcount

    artist.trackcount = tcount
    artist.albumcount = acount

    artist.duration = sum(t.duration for t in tracks)

    return {"artist": artist, "tracks": tracks[:limit]}


@artist_bp.route("/artist/<artisthash>/albums", methods=["GET"])
def get_artist_albums(artisthash: str):
    limit = request.args.get("limit")

    if limit is None:
        limit = 6

    limit = int(limit)

    all_albums = []
    is_cached = ArtistsCache.albums_cached(artisthash)

    if not is_cached:
        add_albums_to_cache(artisthash)

    albums_fetched = ArtistsCache.albums_fetched(artisthash)

    if not albums_fetched:
        ArtistsCache.get_albums(artisthash)

    all_albums, index = ArtistsCache.get_albums_by_artisthash(artisthash)

    if not ArtistsCache.artists[index].type_checked:
        ArtistsCache.process_album_type(artisthash)

    singles = [a for a in all_albums if a.is_single]
    eps = [a for a in all_albums if a.is_EP]

    def remove_EPs_and_singles(albums: list[Album]):
        albums = [a for a in albums if not a.is_EP]
        albums = [a for a in albums if not a.is_single]
        return albums

    albums = filter(lambda a: artisthash in a.albumartisthash, all_albums)
    albums = list(albums)
    albums = remove_EPs_and_singles(albums)

    appearances = filter(lambda a: artisthash not in a.albumartisthash, all_albums)
    appearances = list(appearances)

    appearances = remove_EPs_and_singles(appearances)

    return {
        "albums": albums[:limit],
        "singles": singles[:limit],
        "eps": eps[:limit],
        "appearances": appearances[:limit],
    }


@artist_bp.route("/artist/<artisthash>/tracks", methods=["GET"])
def get_artist_tracks(artisthash: str):
    """
    Returns all artists by a given artist.
    """
    tracks = Store.get_tracks_by_artist(artisthash)

    return {"tracks": tracks}
    # artist = Store.get_artist_by_hash(artisthash)
    # if artist is None:
    #     return {"error": "Artist not found"}, 404

    # return {"albums": albums[:limit]}


# @artist_bp.route("/artist/<artist>")
# @cache.cached()
# def get_artist_data(artist: str):
#     """Returns the artist's data, tracks and albums"""
#     artist = urllib.parse.unquote(artist)
#     artist_obj = instances.artist_instance.get_artists_by_name(artist)

#     def get_artist_tracks():
#         songs = instances.tracks_instance.find_songs_by_artist(artist)

#         return songs

#     artist_songs = get_artist_tracks()
#     songs = utils.remove_duplicates(artist_songs)

#     def get_artist_albums():
#         artist_albums = []
#         albums_with_count = []

#         albums = instances.tracks_instance.find_songs_by_albumartist(artist)

#         for song in albums:
#             if song["album"] not in artist_albums:
#                 artist_albums.append(song["album"])

#         for album in artist_albums:
#             count = 0
#             length = 0

#             for song in artist_songs:
#                 if song["album"] == album:
#                     count = count + 1
#                     length = length + song["length"]

#             album_ = {"title": album, "count": count, "length": length}

#             albums_with_count.append(album_)

#         return albums_with_count

#     return {
#         "artist": artist_obj,
#         "songs": songs,
#         "albums": get_artist_albums()
#     }
