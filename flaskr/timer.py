import functools
from datetime import date

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
        course_name = request.form.get('course-select')
        time_string = request.form.get('labelValue')
        print(time_string)

        # Grab hours,minutes, and seconds ffomr the label string
        hours = time_string[:2]
        print(str(hours) + "hrs")
        minutes = time_string[4:5]
        print(str(minutes) + "min")
        seconds = time_string[7:8]
        print(str(seconds) + "sec")

        # convert to int
        if(time_string != ""):
            hours = int(hours)
            minutes = int(minutes)
            seconds = int(seconds)
            # Convert all times to seconds and determine number of hours
            total_hours = hours + (minutes / 60) + (seconds / 3600)
        else:
            hours = 0
            minutes = 0
            seconds = 0
            total_hours = 0

        
        # Get today's date
        today_date = date.today()
        print(today_date)

        #Get current week
        week_number = today_date.isocalendar()[1]  # Get the week number (second element of the tuple)


        #Commit data to sql database
        db.execute(
                    "INSERT INTO logged_hours (user_username, course_name, hours, log_date, week_number) VALUES (?, ?, ?, ?, ?)",
                    (user_id, course_name, total_hours, today_date, week_number)
                    )
        db.commit()

       

        return render_template('dash/timer.html',  courses=courses)
    return render_template('dash/timer.html',  courses=courses)