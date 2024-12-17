import functools

from datetime import datetime
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from flaskr.db import get_db
import sqlite3


bp = Blueprint('del', __name__, url_prefix='/delete_course')

@bp.route('/delete', methods=('GET','POST'))
def delete_course():
    db = get_db()
    user_id = session.get('user_id')
    courses = db.execute("SELECT course_name FROM course WHERE user_username = ?", (user_id,)).fetchall()
    entries = []

    if request.method == 'POST':
         course_to_remove = request.form.get('course') 
         course_entry = request.form.get('course-entry')
         if course_to_remove:
            if not course_to_remove.strip():
                error = 'Course name is required.'
            else:
                try:
                    db.execute(
                        "DELETE FROM course WHERE user_username = ? AND course_name = ?",
                        (user_id, course_to_remove)
                    )
                    db.execute(
                        "DELETE FROM logged_hours WHERE user_username = ? AND course_name = ?",
                        (user_id, course_to_remove)
                    )

                    db.commit()
                    flash('Course deleted successfully.')
                except sqlite3.IntegrityError:
                    error = f"Course {course_to_remove} does not exist."
            #Updates the input into the
            return redirect(url_for('del.delete_course'))
         if course_entry:
            entries = db.execute("SELECT course_name, hours, log_date FROM logged_hours WHERE user_username = ? AND course_name = ?"
            , (user_id, course_entry)).fetchall()
            return redirect(url_for('del.delete_course'))
         
                

         
         
    return render_template('dash/delete_course.html', courses=courses, entries=entries )

