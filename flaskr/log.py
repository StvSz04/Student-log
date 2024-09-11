import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
from werkzeug.security import check_password_hash, generate_password_hash

from flaskr.db import get_db

bp = Blueprint('log', __name__, url_prefix='/log')

# This view registers a user into the database
@bp.route('/register_course', methods=('GET', 'POST'))
def register_class():
    if request.method == 'POST':
        course = request.form['course_name']
        db = get_db()
        error = None

        if error is None:
                db.execute(
                    "INSERT INTO course (course_name) VALUES (?)"
                )
                db.commit()

        flash(error)

    return render_template('auth/log_page.html')