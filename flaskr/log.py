import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
from werkzeug.security import check_password_hash, generate_password_hash

from flaskr.db import get_db

from jinja2 import Environment, FileSystemLoader

bp = Blueprint('log', __name__, url_prefix='/log')

# This view registers a users course into the database
@bp.route('/register_course', methods=('GET', 'POST'))
def register_class():
    if request.method == 'POST':
        course = request.form['course_name']
        user_id = session.get('user_id')

        db = get_db()
        error = None

        if not course:
            error = 'Course name is required.'

        if error is None:
            try:
                db.execute(
                    "INSERT INTO course (user_username, course_name) VALUES (?, ?)",
                    (user_id, course)
                )
                db.commit()
                flash('Course registered successfully.')
            except db.IntegrityError:
                error = f"Course {course} is already registered."
                flash(error)
        else:
            flash(error)
        
        
        user_id = session.get('user_id')
        #Query the course table
        courses = db.execute("SELECT course_name FROM course WHERE user_username = ?", (user_id,)).fetchall()

    return render_template('dash/log_page.html', courses = courses)


# This view will used to commit the changes to the database
#def log_hours():
     #return render_template('dash/log_page.html')
