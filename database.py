import sqlite3

#___________DATABASE_____________________
# Function to create and connect to the database
def create_connect_db():
    connector = sqlite3.connect("news.db")
    # create a cursor to the database
    cursor_to_connecter = connector.cursor()
    # create table if it does not exist
    connector.execute("""
    CREATE TABLE IF NOT EXISTS user_info (
        email TEXT PRIMARY KEY,
        password TEXT
    )
    """)
    return connector, cursor_to_connecter

# set up connection
connector, cursor_to_connecter = create_connect_db()

# Don't forget to close the connection when you're done
def get_connector():
    return connector

def get_cursor_to_connector():
    return cursor_to_connecter

def close_connection():
    connector.commit()
    connector.close()
