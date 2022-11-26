"""
This module contains the functions to interact with the SQLite database.
"""

from pathlib import Path
import sqlite3
from sqlite3 import Connection as SqlConn, Error as SqlError

from app.settings import DB_PATH


def create_connection(db_file: str) -> SqlConn:
    """
    Creates a connection to the specified database.
    """
    conn = sqlite3.connect(db_file)
    return conn


def get_sqlite_conn():
    """
    It opens a connection to the database
    :return: A connection to the database.
    """
    return create_connection(DB_PATH)


def create_tables(conn: SqlConn, sql_path: str):
    """
    Executes the specifiend SQL file to create database tables.
    """
    with open(sql_path, "r", encoding="utf-8") as sql_file:
        conn.executescript(sql_file.read())


def setup_search_db():
    """
    Creates the search database.
    """
    db = sqlite3.connect(":memory:")
    sql_file = "queries/fts5.sql"

    current_path = Path(__file__).parent.resolve()
    sql_path = current_path.joinpath(sql_file)

    with open(sql_path, "r", encoding="utf-8") as sql_file:
        db.executescript(sql_file.read())