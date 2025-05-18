import functools

from datetime import datetime
from datetime import date

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify
)

from flaskr.db import get_db
import sqlite3

bp = Blueprint('vis', __name__, url_prefix='/visualize')

@bp.route('/graph', methods=('GET', 'POST'))
def display_graphs():
    db = get_db()  # Get the database connection
    user = session.get('user_id')

    # Assign default values
    current_year = datetime.now().year

    # Create date objects // From January 1st of this year to December 31st this year
    low_date = date(current_year, 1, 1)
    high_date = date(current_year, 12, 31)

    # Convert date to string, then parse back to date (if absolutely needed)
    low_date = datetime.strptime(low_date.strftime('%Y-%m-%d'), '%Y-%m-%d').date()
    high_date = datetime.strptime(high_date.strftime('%Y-%m-%d'), '%Y-%m-%d').date()

    # Query for classes and logged hours.
    # study_data is going to be used to hold all data about user study, hours,weeks,and course
    study_data = {}

    # Get all the user’s courses
    courses = db.execute(
            '''
            SELECT DISTINCT c.course_name
            FROM course c
            JOIN logged_hours lh ON c.course_name = lh.course_name AND c.user_username = lh.user_username
            WHERE c.user_username = ? AND lh.log_date BETWEEN ? AND ?
            ''',
            (user, low_date, high_date)
        ).fetchall()

        # Get the total hours per course within the date range
    course_hours = db.execute(
            'SELECT course_name, SUM(hours) as total_hours '
            'FROM logged_hours '
            'WHERE user_username = ? AND log_date BETWEEN ? AND ? '
            'GROUP BY course_name',
            (user, low_date, high_date)
        ).fetchall()

        # Get the weekly logged hours per course within the date range
    weekly_hours = db.execute(
            'SELECT course_name, strftime("%W", log_date) as week, SUM(hours) as weekly_hours '
            'FROM logged_hours '
            'WHERE user_username = ? AND log_date BETWEEN ? AND ? '
            'GROUP BY course_name, week '
            'ORDER BY week',
            (user, low_date, high_date)
        ).fetchall()



    if request.method == 'POST':
        #Grab low and high dates and convert to datetime objects
        low_date = request.form.get('low-date')
        high_date = request.form.get('high-date')
        low_date = datetime.strptime(low_date, '%Y-%m-%d').date()
        high_date = datetime.strptime(high_date, '%Y-%m-%d').date()

        # Get all the user’s courses
        courses = db.execute(
            '''
            SELECT DISTINCT c.course_name
            FROM course c
            JOIN logged_hours lh ON c.course_name = lh.course_name AND c.user_username = lh.user_username
            WHERE c.user_username = ? AND lh.log_date BETWEEN ? AND ?
            ''',
            (user, low_date, high_date)
        ).fetchall()

        # Get the total hours per course within the date range
        course_hours = db.execute(
            'SELECT course_name, SUM(hours) as total_hours '
            'FROM logged_hours '
            'WHERE user_username = ? AND log_date BETWEEN ? AND ? '
            'GROUP BY course_name',
            (user, low_date, high_date)
        ).fetchall()

        # Get the weekly logged hours per course within the date range
        weekly_hours = db.execute(
            'SELECT course_name, strftime("%W", log_date) as week, SUM(hours) as weekly_hours '
            'FROM logged_hours '
            'WHERE user_username = ? AND log_date BETWEEN ? AND ? '
            'GROUP BY course_name, week '
            'ORDER BY week',
            (user, low_date, high_date)
        ).fetchall()

    
    # Prepare the data to be passed to the template
    study_data['classes_data'] = [row['course_name'] for row in courses]  # Course names
    study_data['hours_data'] = [row['total_hours'] for row in course_hours]  # Total hours per course
    study_data['weeks_data'] = sorted(set([f"Week {int(row['week']) + 1}" for row in weekly_hours]))  # Unique weeks

    # This creates a dictionary where each course maps to a list of dictionaries with week and weekly_hours
    study_data['study_hours_data'] = {}
    for row in weekly_hours:
        course_name = row['course_name']
        week_data = {'week': row['week'], 'weekly_hours': row['weekly_hours']}
        if course_name not in study_data['study_hours_data']:
            study_data['study_hours_data'][course_name] = []
        study_data['study_hours_data'][course_name].append(week_data)

    
    # Render the template with the html
    # Returns study_data as dict
    return render_template('dash/visualize.html', study_data=study_data)