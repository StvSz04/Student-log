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
    return render_template('dash/log_page.html')