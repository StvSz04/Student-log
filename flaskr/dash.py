import functools

from datetime import datetime
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from flaskr.db import get_db
import sqlite3


bp = Blueprint('dash', __name__, url_prefix='/dash')

# Dashboard page
@bp.route('/dashboard', methods=('GET', 'POST'))
def go_to_dashboard():
    db = get_db()
    user_id = session.get('user_id')

    # Fetch row object from sql db and extract badge_level
    row = db.execute("SELECT badge FROM user WHERE id = ?", (user_id,)).fetchone()
    badge_level = row[0] if row else None

    


    return render_template('dash/dashboard.html', badge_level=badge_level)

# Log_courses page
@bp.route('/log')
def go_to_log():
    return redirect(url_for('log.log_hours'))

# Log_courses page
@bp.route('/graphs')
def go_to_vis():
    return redirect(url_for('vis.display_graphs'))

# delete_courses page
@bp.route('/delete')
def go_to_del():
    return redirect(url_for('delete.delete_course'))

# settings page
@bp.route('/settings')
def go_to_settings():
    return redirect(url_for('setting.delete_account'))
# timer page
@bp.route('/timer')
def go_to_timer():
    return redirect(url_for('time.get_time'))
# Comparison page
@bp.route('/comp')
def go_to_comp():
    return redirect(url_for('comp.compare_hours'))

@bp.route('/flash')
def go_to_flash():
    return redirect(url_for('flash.flashcard'))



