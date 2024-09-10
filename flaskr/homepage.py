import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

bp = Blueprint('home', __name__, url_prefix='/home')


# Main page
@bp.route('/')
def go_to_homepage():
    return render_template('index.html')