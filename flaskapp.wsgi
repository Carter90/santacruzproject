#flaskapp.wsgi
import sys
sys.path.insert(0, '/var/www/html/flaskapp')

from main import app as application
