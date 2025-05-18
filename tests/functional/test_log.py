from flaskr import create_app

def test_log_hours():
    """
    Given a Flask app for testing
    When the '/log_hours' page gives a "POST"
    Then check that hours are sumbitted
    """
    flask_app = create_app('flask_test.cfg')

    #Create a test client using the flask app
    