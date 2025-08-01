import os

from flask import Flask,render_template

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__,instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    @app.route('/')
    def go_to_homepage():
     return render_template('index.html')



    #These next lines include the blueprints and corresponding views
    from . import db
    db.init_app(app)

    from . import auth
    app.register_blueprint(auth.bp)

    from . import homepage
    app.register_blueprint(homepage.bp)

    from . import dash
    app.register_blueprint(dash.bp)

    from . import log
    app.register_blueprint(log.bp)

    from . import vis
    app.register_blueprint(vis.bp)

    from . import delete_course
    app.register_blueprint(delete_course.bp)

    from . import settings
    app.register_blueprint(settings.bp)

    from . import timer
    app.register_blueprint(timer.bp)

    from . import comp
    app.register_blueprint(comp.bp)

    from . import flashcard
    app.register_blueprint(flashcard.bp)

    return app