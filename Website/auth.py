from flask import Blueprint, render_template, request, flash, redirect, url_for
from .models import User
from werkzeug.security import generate_password_hash, check_password_hash
from . import db
from flask_login import login_user, login_required, logout_user, current_user

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()
        if user:
          if check_password_hash(user.password, password):
            flash('logged in successfully.', category='success')
            login_user(user, remember=True)
            return redirect(url_for('view.room'))
          else:
            flash('incorrect password try again', category='error')
        else:
          flash('email does not exist.', category='error')

          

    return render_template("login.html")


@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login')) 


@auth.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
    if request.method == 'POST':
        email = request.form.get('email')
        fullname = request.form.get('fullname')
        username = request.form.get('username')
        password1 = request.form.get('password1')
        confirm = request.form.get('confirm')

        user = User.query.filter_by(email=email).first()
        if user:
          flash('user already exist.', category='error')
          
        elif not all([email, fullname, username, password1, confirm]):
            flash('All fields are required.', category='error')
        elif len(email) < 4:
            flash('Invalid email.', category='error')
        elif len(fullname) < 2:
            flash('Full name must be greater than 1 character.', category='error')
        elif len(username) > 15:
            flash('Username must be 15 characters or below.', category='error')
        elif password1 != confirm:
            flash('Passwords do not match.', category='error')
        elif len(password1) < 6:
            flash('Password must be at least 6 characters.', category='error')
        else:
            
            new_user = User(
                email=email,
                fullname=fullname,
                username=username,
                password=generate_password_hash(password1)
            )
            db.session.add(new_user)
            db.session.commit()
            login_user(user, remember=True)
            flash('Account created successfully!', category='success')
            return redirect(url_for('view.room')) # FIXED: Usually 'view.home', 

    return render_template("sign_up.html")
