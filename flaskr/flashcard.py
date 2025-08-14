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
        cardCount = int(request.form.get("card-count"))
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
        
            fronts = [value for key, value in request.form.items() if key.startswith("front")]
            backs = [value for key, value in request.form.items() if key.startswith("back")]

            print(len(fronts),len(backs))
            print(fronts,backs)


            for i in range(0,cardCount):       
                print(i,cardCount)
                db.execute("INSERT INTO Flashcard (set_id, place, front, back) VALUES (?, ?, ?, ?)",
                        (setId, i, fronts[i], backs[i]))
            db.commit()

            return redirect(url_for('flash.flashcard'))
            
        except Exception as e:
            print("FAILED!!!", e)
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


# Send set info
@bp.route('/listSet', methods = ('GET',))
def listSet():
    user_id = session.get('user_id')
    db = get_db()

    if request.method == 'GET':
        folder_list = request.args.getlist('folder_list') 

        data = []

        for i in range(len(folder_list)):
            cursor = db.execute(
                "SELECT set_name FROM FlashcardSet WHERE folder_name = ? AND user_username = ?",
                (folder_list[i], user_id)
            )
            data.extend([dict(row) for row in cursor.fetchall()])

        return jsonify(data)
    
    
    
    return render_template('dash/flashcard.html')

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


@bp.route('/deleteFolders',methods=('GET', 'POST'))
def deleteFolders():
    user_id = session.get('user_id')
    db = get_db()
    
    if request.method == 'GET':
    
        # Retreive appeneded data
        folder_names = request.args.getlist('folder_name')

        for i in range(len(folder_names)):
            db.execute("DELETE FROM Folders WHERE folder_name = ?", (folder_names[i],))

        db.commit()

        data = {"Response" : True}

        return jsonify(data)     
    
# For creating Falshcard sets
@bp.route('/flashUpdate', methods=('GET','POST'))
def flashcardUpdate():
    user_id = session.get('user_id')
    db = get_db()
    
    if request.method == 'POST':
        # Recieve data from POST
        setName = request.form.get("set-name") 
        newSetName = request.form.get("new-set-name")
        cardCount = int(request.form.get("card-count"))
        folderName = request.form.get("folder-name")
        print("Set Name: ", setName)
        print("Folder Name: ", folderName)

        
        try:
            # Update folder or setname
            db.execute(
                "UPDATE FlashcardSet SET folder_name = ?, set_name =? WHERE set_name = ? AND user_username = ?",
                (folderName, newSetName,setName,user_id)
            )

            db.commit() # Commit changes

            # Grab setId
            setId = db.execute(
                    "SELECT set_id FROM FlashcardSet WHERE set_name = ? AND user_username = ?",
                    (newSetName, user_id)
                ).fetchone()[0]
            
            #  Delete all set info
            db.execute("DELETE FROM Flashcard WHERE set_id = ?",(setId,))
            db.commit() # Commit changes
        
            # For each flash card insert into db
            # Grab every html element that startwith "ront" and "back"
            fronts = [value for key, value in request.form.items() if key.startswith("front")]
            backs = [value for key, value in request.form.items() if key.startswith("back")]

            for i in range(0,cardCount):       
            
                db.execute("INSERT INTO Flashcard (set_id, place, front, back) VALUES (?, ?, ?, ?)",
                        (setId, i, fronts[i], backs[i]))
                
            db.commit()


                
            print("Success")
            return redirect(url_for('flash.flashcard'))
            
        except Exception as e:
            print("FAILED!!!", e)
            return redirect(url_for('flash.flashcard'))


     
     
    return render_template('dash/flashcard.html')