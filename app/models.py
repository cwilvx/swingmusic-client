"""
Contains all the models for objects generation and typing.
"""
import dataclasses
import json
from dataclasses import dataclass

from app import utils

# from operator import itemgetter


@dataclass(slots=True)
class Track:
    """
    Track class
    """

    id: int
    album: str
    albumartist: str
    albumhash: str
    artist: str | list[str]
    bitrate: int
    copyright: str
    date: str
    disc: int
    duration: int
    filepath: str
    folder: str
    genre: str | list[str]
    title: str
    track: int
    trackhash: str

    filetype: str = ""
    image: str = ""

    def __post_init__(self):
        if self.artist is not None:
            self.artist = str(self.artist).split(", ")

        self.filetype = self.filepath.rsplit(".", maxsplit=1)[-1]
        self.image = self.albumhash + ".webp"

        if self.genre is not None:
            self.genre = str(self.genre).replace("/", ", ")
            self.genre = str(self.genre).lower().split(", ")


@dataclass(slots=True)
class Artist:
    """
    Artist class
    """

    name: str
    image: str

    def __init__(self, name: str):
        self.name = name
        self.image = utils.create_safe_name(name) + ".webp"


@dataclass
class Album:
    """
    Creates an album object
    """

    id: int
    albumartist: str
    albumhash: str
    colors: str | list[str]
    copyright: str
    date: int
    title: str

    albumartisthash: str = ""
    image: str = ""
    artistimg: str = ""
    count: int = 0
    duration: int = 0

    is_soundtrack: bool = False
    is_compilation: bool = False
    is_single: bool = False
    is_EP: bool = False
    genres: list[str] = dataclasses.field(default_factory=list)

    def __post_init__(self):
        self.image = self.albumhash + ".webp"
        self.albumartisthash = utils.create_safe_name(self.albumartist)
        self.artistimg = self.albumartisthash + ".webp"

        if self.colors is not None:
            self.colors = json.loads(str(self.colors))

    def check_type(self):
        """
        Runs all the checks to determine the type of album.
        """
        self.is_soundtrack = self.check_is_soundtrack()
        if self.is_soundtrack:
            return

        self.is_compilation = self.check_is_compilation()
        if self.is_compilation:
            return

        self.is_EP = self.check_is_EP()

    def check_is_soundtrack(self) -> bool:
        """
        Checks if the album is a soundtrack.
        """
        keywords = ["motion picture", "soundtrack"]
        for keyword in keywords:
            if keyword in self.title.lower():
                return True

        return False

    def check_is_compilation(self) -> bool:
        """
        Checks if the album is a compilation.
        """
        return "various artists" in self.albumartist.lower()

    def check_is_EP(self) -> bool:
        """
        Checks if the album is an EP.
        """
        return self.title.strip().endswith(" EP")


@dataclass
class Playlist:
    """Creates playlist objects"""

    id: int
    artisthashes: str | list[str]
    image: str
    last_updated: str
    name: str
    trackhashes: str | list[str]

    thumb: str = ""
    count: int = 0
    duration: int = 0

    # def __init__(self, data):
    #     self.id = data["_id"]["$oid"]
    #     self.tracks = []
    #     self.pretracks = data["pre_tracks"]
    #     self.count = len(self.pretracks)
    #     self.write_props(data)

    def __post_init__(self):
        self.trackhashes = json.loads(str(self.trackhashes))
        self.artisthashes = json.loads(str(self.artisthashes))

        self.count = len(self.trackhashes)

        if self.image is not None:
            self.thumb = "thumb_" + self.image
        else:
            self.image = "None"
            self.thumb = "None"

    # def update_playlist(self, data: dict):
    #     self.write_props(data)

    # TODO: Find a better name for this method
    # def write_props(self, data: dict):
    #     (self.name, self.image, self.thumb, self.last_updated,) = itemgetter(
    #         "name",
    #         "image",
    #         "thumb",
    #         "last_updated",
    #     )(data)


@dataclass
class Folder:
    name: str
    path: str
    trackcount: int
    is_sym: bool = False
    path_token_count:int = 0