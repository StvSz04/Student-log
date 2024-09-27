import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from flaskr.db import get_db
import sqlite3

bp = Blueprint('vis', __name__, url_prefix='/visualize')

@bp.route('/graph')
def display_graphs():
    db = get_db()  # Get the database connection
    user = session.get('user_id')

    # Query for classes and logged hours
    study_data = {}

    # Get the list of courses for the user
    courses = db.execute(
        'SELECT course_name FROM course WHERE user_username = ?',
        (user,)
    ).fetchall()

    # Get the total hours per course for the user
    course_hours = db.execute(
        'SELECT course_name, SUM(hours) as total_hours '
        'FROM logged_hours '
        'WHERE user_username = ? '
        'GROUP BY course_name',
        (user,)
    ).fetchall()

    # Get the weekly logged hours for each course
    weekly_hours = db.execute(
        'SELECT course_name, strftime("%W", log_date) as week, SUM(hours) as weekly_hours '
        'FROM logged_hours '
        'WHERE user_username = ? '
        'GROUP BY course_name, week '
        'ORDER BY week',
        (user,)
    ).fetchall()

    # Prepare the data to be passed to the template
    study_data['classes_data'] = [row['course_name'] for row in courses]  # Course names
    study_data['hours_data'] = [row['total_hours'] for row in course_hours]  # Total hours per course
    study_data['weeks_data'] = sorted(set([f"Week {int(row['week']) + 1}" for row in weekly_hours]))  # Unique weeks
    study_data['study_hours_data'] = [row['weekly_hours'] for row in weekly_hours]  # Hours per week

    # Render the template with the dynamic data
    return render_template('dash/visualize.html', study_data=study_data)