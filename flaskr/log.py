import functools

from datetime import datetime
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from flaskr.db import get_db
import sqlite3

bp = Blueprint('log', __name__, url_prefix='/log')



# Combined view for course registration and hour logging
@bp.route('/log_hours', methods=('GET', 'POST'))
def log_hours():
    # Fetch existing courses for the user
    user_id = session.get('user_id')
    db = get_db()
    courses = db.execute("SELECT course_name FROM course WHERE user_username = ?", (user_id,)).fetchall()

    # Handle POST request for both course registration and hour logging
    if request.method == 'POST':
        # Retrieve form data
        new_course = request.form.get('new-course')
        selected_course = request.form.get('course-select')
        hours = request.form.get('hours')
        log_date = request.form.get('log-date')
        
        error = None

        # Register a new course if provided
        if new_course:
            if not new_course.strip():
                error = 'Course name is required.'
            else:
                try:
                    db.execute(
                        "INSERT INTO course (user_username, course_name) VALUES (?, ?)",
                        (user_id, new_course)
                    )
                    db.commit()
                    flash('Course registered successfully.')
                    courses = db.execute("SELECT course_name FROM course WHERE user_username = ?", (user_id,)).fetchall()
                except sqlite3.IntegrityError:
                    error = f"Course {new_course} is already registered."
            #Updates the input into the
            return redirect(url_for('log.log_hours'))

        # Log hours if course, hours, and date are provided
        if selected_course or new_course:
            course_name = selected_course or new_course

            if hours and log_date:
                try:
                    # Ensure log_date is a datetime object
                    if isinstance(log_date, str):
                        log_date = datetime.strptime(log_date, '%Y-%m-%d').date()

                    # Extract the week number directly from log_date using isocalendar()
                    week_number = log_date.isocalendar()[1]  # Get the week number (second element of the tuple)

                    # Insert a new course log
                    db.execute(
                        "INSERT INTO logged_hours (user_username, course_name, hours, log_date, week_number) VALUES (?, ?, ?, ?, ?)",
                        (user_id, course_name, hours, log_date, week_number)
                    )
                    db.commit()

                    # Batch update week_number if necessary might need to delete
                    db.execute('''
                        UPDATE logged_hours
                        SET week_number = CAST(strftime('%W', log_date) AS INTEGER)
                        WHERE week_number = 0
                    ''')
                    db.commit()

                    # Update the user badge level after every new entry
                    db.execute('''
                            UPDATE user
                            SET badge = (
                                SELECT
                                    CASE
                                        WHEN SUM(lh.hours) >= 100 THEN 4  -- Platinum badge
                                        WHEN SUM(lh.hours) >= 50 THEN 3   -- Gold badge
                                        WHEN SUM(lh.hours) >= 25 THEN 2   -- Silver badge
                                        WHEN SUM(lh.hours) >= 10 THEN 1   -- Bronze badge
                                        ELSE 0                            -- No badge
                                    END
                                FROM logged_hours lh
                                WHERE lh.user_username = user.username
                            )
                            WHERE EXISTS (
                                SELECT 1
                                FROM logged_hours lh
                                WHERE lh.user_username = user.username
                            )
                        ''')
                    db.commit()

                    flash('Hours logged successfully.')
                except sqlite3.IntegrityError:
                    flash('An entry for this date and course already exists.')
                except Exception as e:
                    flash(f"An error occurred: {e}")
            else:
                flash('Hours and log date are required to log time.')
        else:
            flash('Please select or create a course.')





    # Render the template with courses (for GET requests) or after processing POST request
    return render_template('dash/log_page.html', courses=courses)

