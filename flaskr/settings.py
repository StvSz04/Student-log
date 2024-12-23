import functools

from datetime import datetime
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from flaskr.db import get_db
import sqlite3

bp = Blueprint('setting', __name__, url_prefix='/setting')

@bp.route('/account', methods=('GET','POST'))
def delete_account():
    db = get_db()
    user_id = session.get('user_id')
    
    if request.method == 'POST':
        #Clear database
        db.execute('DELETE FROM logged_hours WHERE user_username = ?', (user_id,))
        db.execute('DELETE FROM course WHERE user_username = ?', (user_id,))
        db.execute('DELETE FROM user WHERE id = ?', (user_id,))

        db.commit()
        session.clear()
        return redirect(url_for('home.go_to_homepage'))
        #return render_template('dash/settings.html')


    return render_template('dash/settings.html')