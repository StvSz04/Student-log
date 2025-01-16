import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify
)

from flaskr.db import get_db
import sqlite3


bp = Blueprint('time', __name__, url_prefix='/timer')

@bp.route('/timer', methods=('GET','POST'))
def get_time():
    db = get_db()
    user_id = session.get('user_id')
    courses = db.execute("SELECT course_name FROM course WHERE user_username = ?", (user_id,)).fetchall()


    if request.method == 'POST':
        course = request.form.get('course-select')
        #time_string = request.form.get('timer-label')

        #hours = time_string[:2]
        #minutes = time_string[4:5]
        #seconds = time_string[7:8]

        return render_template('dash/timer.html',  courses=courses)
    return render_template('dash/timer.html',  courses=courses)