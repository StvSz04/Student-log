import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from flaskr.db import get_db
import sqlite3

bp = Blueprint('vis', __name__, url_prefix='/visualize')

@bp.route('/graph')
def display_graphs():
    study_data = {
        'classes': ['Math', 'Science', 'History', 'Literature'],
        'hours': [90, 10, 3, 7],
        'weeks': ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        'study_hours': [5, 10, 15, 20]  # Example data for hours over weeks
    }


    return render_template('dash/visualize.html', study_data=study_data)