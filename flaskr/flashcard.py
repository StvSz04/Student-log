import functools
import json
from flask import jsonify

from datetime import datetime
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from flaskr.db import get_db
import sqlite3

bp = Blueprint('flash', __name__, url_prefix='/flash_card')


# Render base html for page
@bp.route('/dashboard')
def dashboard():
    user_id = session.get('user_id')
    db = get_db()

    cursor = db.execute("SELECT * FROM FlashcardSet WHERE user_username = ?", (user_id,))

    return render_template('dash/flashcard.html')


# Render base html for page
@bp.route('/flash', methods=('GET','POST'))
def flashcard():
    return redirect(url_for('flash.dashboard'))


# For creating Falshcard sets
@bp.route('/flashCreate', methods=('GET','POST'))
def flashcardCreate():
    user_id = session.get('user_id')
    db = get_db()
    
    if request.method == 'POST':
        # Recieve data from POST
        setName = request.form.get("set-name") 
        cardCount = request.form.get("card-count")
        folderName = request.form.get("folder-name")
        print("Set Name: ", setName)
        print("Folder Name: ", folderName)
        cardsFront = []
        cardsBack = []
        
        try:
            # Insert flashcard set to db
            cursor = db.execute(
                "INSERT INTO FlashcardSet (set_name, user_username, folder_name) VALUES (?, ?, ?)",
                (setName, user_id, folderName)
            )
            # Grab setId
            setId = cursor.lastrowid

            db.commit() # Commit changes
        
            # For each flash card insert into db
            for i in range(0, int(cardCount)):
                cardsFront.append(request.form.get(f"front{i}"))
                cardsBack.append(request.form.get(f"back{i}"))

                db.execute(
                    "INSERT INTO Flashcard (set_id,place,front,back) VALUES (?, ?,?,?)",
                    (setId,i,cardsFront[i],cardsBack[i])
                )
                db.commit()

            return redirect(url_for('flash.flashcard'))
            
        except:
            print("FAILED!!!")
            return redirect(url_for('flash.flashcard'))


     
     
    return render_template('dash/flashcard.html')

# For creating folders
@bp.route('/folderCreate', methods=('GET','POST'))
def folderCreate():
    user_id = session.get('user_id')
    db = get_db()

    if request.method == 'POST':
        folderName = request.form.get('folder-name')

        db.execute("INSERT INTO Folders (user_username, folder_name) VALUES (?,?)", (user_id,folderName))
        db.commit()

        return redirect(url_for('flash.flashcard'))

    
    return render_template('dash/flashcard.html')


# Render base html for page
@bp.route('/showSets', methods=('GET','POST'))  
def showSet():
    user_id = session.get('user_id')
    db = get_db()

    if request.method == 'GET':
        # Select all flashcard sets from the db
        cursor = db.execute(
            "SELECT set_name FROM FlashcardSet WHERE user_username = ?",
            (user_id,)
        )

        data = [dict(row) for row in cursor.fetchall()]

        return jsonify(data)
    
    
    
    return render_template('dash/flashcard.html')

# Render base html for page
@bp.route('/renderCards', methods=('GET','POST'))  
def renderCards():
    user_id = session.get('user_id')
    db = get_db()
    
    if request.method == 'GET':
        # Retreive appeneded data
        set_name = request.args.getlist('set_name') 

        #set_ids = [int(sid) for sid in set_ids] # Convert data into int
        data = []  # initialize as an empty list to store results
        set_ids = []
        for i in range(len(set_name)):
            cursor = db.execute("SELECT * FROM FlashcardSet WHERE set_name = ?", (set_name[i],))
            result = cursor.fetchone()
            set_ids.append(result[0])

            cursor = db.execute("SELECT * FROM Flashcard WHERE set_id = ?", (set_ids[i],))
    
            if cursor:
                data.extend([dict(r) for r in cursor.fetchall()])  # append the all the row(flashcard) info to data
            else:
                data.append(None)  # or skip, or handle no-match case as you want


        return jsonify(data)
    
    return render_template('dash/flashcard.html')


# Render base html for page
@bp.route('/deleteSets', methods=('GET','POST'))  
def deleteSets():
    user_id = session.get('user_id')
    db = get_db()
    
    if request.method == 'GET':
    
        # Retreive appeneded data
        set_name = request.args.getlist('set_name') 

        #set_ids = [int(sid) for sid in set_ids] # Convert data into int
        data = []  # initialize as an empty list to store results
        set_ids = []
        for i in range(len(set_name)):
            cursor = db.execute("SELECT * FROM FlashcardSet WHERE set_name = ?", (set_name[i],))
            result = cursor.fetchone()
            set_ids.append(result[0])

            # Delete from the database where the set_id matches
            db.execute("DELETE FROM FlashcardSet WHERE set_id = ?", (set_ids[i],))

        db.commit()

        data = {"Response" : True}

        return jsonify(data)



    return render_template('dash/flashcard.html')



@bp.route('/sendFolders', methods=('GET',))
def sendFolders():

    user_id = session.get('user_id')
    db = get_db()
    
    if request.method == 'GET':

        folders = db.execute(
            "SELECT folder_id, folder_name FROM Folders WHERE user_username = ?",
            (user_id,)
        ).fetchall()

        
        folder_list = [dict(row) for row in folders]

        return jsonify(folder_list)
    
    return render_template('dash/flashcard.html')
    

     