import functools

from datetime import datetime
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from flaskr.db import get_db
import sqlite3


bp = Blueprint('comp', __name__, url_prefix='/compare')

@bp.route('/comp', methods=('GET','POST'))
def compare_hours():
    db = get_db()
    user_id = session.get('user_id')
    courses = db.execute("SELECT course_name FROM course WHERE user_username = ?", (user_id,)).fetchall()

    if request.method == 'POST':
        course_entry = request.form.get('course_for_entries')
        
        if course_entry:
            # Queries
            listUsers = db.execute(
                                    """
                                    SELECT DISTINCT u.username
                                    FROM logged_hours lh
                                    JOIN user u ON lh.user_username = u.id
                                    WHERE lh.course_name = ?
                                    """,
                                    (course_entry,)
                                   ).fetchall()
            # Loop through each user and calculate their total hours for the course
            totalHours = []  # initialize as a list
            for user in listUsers:
                x = db.execute(
                    """
                    SELECT SUM(hours)
                    FROM logged_hours
                    JOIN user ON logged_hours.user_username = user.id
                    WHERE logged_hours.course_name = ? AND user.username = ?
                    """,
                    (course_entry, user['username'])
                ).fetchone()[0]

                totalHours.append(x)

            return render_template('dash/comp.html', listUsers = listUsers, course_entry=course_entry, totalHours=totalHours, courses=courses)
    
    
    return render_template('dash/comp.html', courses=courses)

