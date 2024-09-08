from flask import Flask, render_template
from markupsafe import escape
from flask import request

app = Flask(__name__)
#          <name> --> url variables
@app.route("/")
def home():
    #User imported vaules need escape() to avoid injection attack jinja does automaically
    return render_template('index.html')

if __name__ == '__main__':
   app.run()