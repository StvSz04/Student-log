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
        # Need to recieve JSON object of flash cards 
        # And then send to db
        return render_template('dash/flashcard.html')
     
    return render_template('dash/flashcard.html')