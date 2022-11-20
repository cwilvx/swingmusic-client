"""
This file contains the Playlists class for interacting with the playlist documents in MongoDB.
"""
from bson import ObjectId

from app import utils
from app.db.mongodb import MongoPlaylists, convert_many, convert_one


class Playlists(MongoPlaylists):
    """
    The class for all playlist-related database operations.
    """

    def insert_playlist(self, playlist: dict) -> None:
        """
        Inserts a new playlist object into the database.
        """
        return self.collection.update_one(
            {"name": playlist["name"]},
            {"$set": playlist},
            upsert=True,
        ).upserted_id

    def get_all_playlists(self) -> list:
        """
        Returns all the playlists in the database.
        """
        playlists = self.collection.find()
        return convert_many(playlists)

    def get_playlist_by_id(self, id: str) -> dict:
        """
        Returns a single playlist matching the id in the query params.
        """
        playlist = self.collection.find_one({"_id": ObjectId(id)})
        return convert_one(playlist)

    def set_last_updated(self, playlistid: str) -> None:
        """
        Sets the last_updated field to the current date.
        """
        date = utils.create_new_date()

        return self.collection.update_one(
            {"_id": ObjectId(playlistid)},
            {"$set": {"last_updated": date}},
        )

    def add_track_to_playlist(self, playlistid: str, track: str) -> None:
        """
        Adds a track to a playlist.
        """
        self.collection.update_one(
            {
                "_id": ObjectId(playlistid),
            },
            {"$push": {"pre_tracks": track}},
        )
        self.set_last_updated(playlistid)

    def get_playlist_by_name(self, name: str) -> dict:
        """
        Returns a single playlist matching the name in the query params.
        """
        playlist = self.collection.find_one({"name": name})
        return convert_one(playlist)

    def update_playlist(self, playlistid: str, playlist: dict) -> None:
        """
        Updates a playlist.
        """
        return self.collection.update_one(
            {"_id": ObjectId(playlistid)},
            {"$set": playlist},
        )
