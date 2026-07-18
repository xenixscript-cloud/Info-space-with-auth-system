from flask import Blueprint, render_template
from flask_login import login_required, current_user

view = Blueprint('view', __name__)

@view.route('/')
def home():
  return render_template("Home.html")

@view.route('/room')
@login_required
def room():
  return render_template("room.html")

@view.route("/posts")
@login_required
def posts():
    return render_template("posts.html")

@view.route("/profiles")
@login_required
def profiles():
    return render_template("profiles.html")