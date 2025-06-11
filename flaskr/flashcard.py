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
@bp.route('/flash', methods=('GET','POST'))
def flashcard():
    return redirect(url_for('flash.flashcardCreate')) # A bit jank

# For creating
@bp.route('/flashCreate', methods=('GET','POST'))
def flashcardCreate():
    user_id = session.get('user_id')
    db = get_db()
    
    if request.method == 'POST':
        # Recieve data from POST
        print("Full form data:", request.form)
        setName = request.form.get("set-name") 
        cardCount = request.form.get("card-count")
        cardsFront = []
        cardsBack = []

        # Insert flashcard set to db
        db.execute(
            "INSERT INTO FlashcardSet (set_name, user_username) VALUES (?, ?)",
            (setName,user_id)
        )

        db.commit()

        cursor = db.execute(
            "SELECT set_id FROM FlashcardSet WHERE set_name = ? AND user_username = ?",
            (setName, user_id)
        )

        row = cursor.fetchone()  # This is the result row
        
        # Extract the set_id safely
        if row:
            setId = row[0]
        else:
            setId = None  # Handle the case where the set was not found
    
        # For each flash card insert into db
        for i in range(0, int(cardCount)):
            cardsFront.append(request.form.get(f"front{i}"))
            cardsBack.append(request.form.get(f"back{i}"))

            print("Sending to DB......")
            db.execute(
                "INSERT INTO Flashcard (set_id,place,front,back) VALUES (?, ?,?,?)",
                (setId,i,cardsFront[i],cardsBack[i])
             )
            db.commit()
            print("Sent to DB!")

        return redirect(url_for('flash.flashcardCreate'))
     
     
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
        set_ids = request.args.getlist('set_id') 
        set_ids = [int(sid) for sid in set_ids] # Convert data into int
        print("Received set_ids:", set_ids)
        
        # data = db.execute("SELECT set_name FROM Flashcard WHERE user_username = ?",
            # (user_id,))

        test = {"name" : "john"}

        return test
    
    return render_template('dash/flashcard.html')




     