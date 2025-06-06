# Student-log

Programming/Testing Section
venv\Scripts\Activate     
flask --app flaskr init-db    
flask --app flaskr run --debug  

python -m pytest within python interperter 
-v
tests/unit or /functional

--last-failed

Database Section
 
cd C:\Users\iamst\OneDrive\Desktop\Student-Log\instance
sqlite3 flaskr.sqlite


Pythonanwhere Section

Whenever you push new changes to GitHub from your local machine, then on PythonAnywhere:

    Open the Bash console.

    Navigate to your repo:

cd /home/Over04/your-repo-name

Pull the changes:

git pull origin main  # or 'master' depending on your default branch

Reload your web app from the Web tab (or run touch reload):

touch /var/www/over04_pythonanywhere_com_wsgi.py

