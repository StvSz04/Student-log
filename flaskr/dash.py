import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

bp = Blueprint('dash', __name__, url_prefix='/dash')

# Dashboard page
@bp.route('/dashboard')
def go_to_dashboard():
    return render_template('dash/dashboard.html')

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
    return redirect(url_for('del.delete_course'))

# settings page
@bp.route('/settings')
def go_to_settings():
    return redirect(url_for('setting.delete_account'))
# timer page
@bp.route('/timer')
def go_to_timer():
    return redirect(url_for('time.get_time'))
