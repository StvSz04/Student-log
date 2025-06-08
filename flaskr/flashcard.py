import functools

from datetime import datetime
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from flaskr.db import get_db
import sqlite3

bp = Blueprint('flash', __name__, url_prefix='/flash_card')

@bp.route('/flash', methods=('GET','POST'))
def flashcard():
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
            print(cardsFront[i])
            print(cardsBack[i])

            db.execute(
                "INSERT INTO Flashcard (set_id,place,front,back) VALUES (?, ?,?,?)",
                (setId,i,cardsFront[i],cardsBack[i])
             )



        return redirect(url_for('flash.flashcard'))
     
    return render_template('dash/flashcard.html')