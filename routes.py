import os
from datetime import datetime
from flask import render_template, request, redirect, url_for, flash, session, send_from_directory
from werkzeug.utils import secure_filename
from app import app, db
from models import User, Class, Enrollment, Material

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'avi', 'mov'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['username'] = user.username
            session['role'] = user.role
            
            if user.role == 'teacher':
                return redirect(url_for('teacher_dashboard'))
            else:
                return redirect(url_for('student_dashboard'))
        else:
            flash('Invalid username or password')
    
    return redirect(url_for('index'))

@app.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    email = request.form['email']
    password = request.form['password']
    role = request.form.get('role', 'student')
    
    # Check if user exists
    if User.query.filter_by(username=username).first():
        flash('Username already exists')
        return redirect(url_for('index'))
    
    if User.query.filter_by(email=email).first():
        flash('Email already exists')
        return redirect(url_for('index'))
    
    # Create new user
    user = User(username=username, email=email, role=role)
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    flash('Registration successful! Please login.')
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/teacher/dashboard')
def teacher_dashboard():
    if 'user_id' not in session or session.get('role') != 'teacher':
        return redirect(url_for('index'))
    
    teacher_id = session['user_id']
    classes = Class.query.filter_by(teacher_id=teacher_id).order_by(Class.scheduled_time.desc()).all()
    
    # Calculate statistics
    total_classes = len(classes)
    live_classes = len([c for c in classes if c.status == 'live'])
    completed_classes = len([c for c in classes if c.status == 'completed'])
    
    # Get recent materials
    recent_materials = Material.query.join(Class).filter(Class.teacher_id == teacher_id).order_by(Material.uploaded_at.desc()).limit(5).all()
    
    return render_template('teacher_dashboard.html', 
                         classes=classes, 
                         total_classes=total_classes,
                         live_classes=live_classes,
                         completed_classes=completed_classes,
                         recent_materials=recent_materials)

@app.route('/student/dashboard')
def student_dashboard():
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect(url_for('index'))
    
    student_id = session['user_id']
    enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    enrolled_classes = [e.class_ref for e in enrollments]
    
    # Get available classes for enrollment
    available_classes = Class.query.filter(~Class.id.in_([c.id for c in enrolled_classes])).all()
    
    return render_template('student_dashboard.html', 
                         enrolled_classes=enrolled_classes,
                         available_classes=available_classes,
                         enrollments=enrollments)

@app.route('/create_class', methods=['POST'])
def create_class():
    if 'user_id' not in session or session.get('role') != 'teacher':
        return redirect(url_for('index'))
    
    title = request.form['title']
    description = request.form['description']
    scheduled_time = datetime.strptime(request.form['scheduled_time'], '%Y-%m-%dT%H:%M')
    duration = int(request.form['duration'])
    
    new_class = Class(
        title=title,
        description=description,
        teacher_id=session['user_id'],
        scheduled_time=scheduled_time,
        duration_minutes=duration
    )
    
    db.session.add(new_class)
    db.session.commit()
    
    flash('Class created successfully!')
    return redirect(url_for('teacher_dashboard'))

@app.route('/enroll/<int:class_id>')
def enroll_class(class_id):
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect(url_for('index'))
    
    student_id = session['user_id']
    
    # Check if already enrolled
    existing_enrollment = Enrollment.query.filter_by(student_id=student_id, class_id=class_id).first()
    if existing_enrollment:
        flash('You are already enrolled in this class!')
        return redirect(url_for('student_dashboard'))
    
    enrollment = Enrollment(student_id=student_id, class_id=class_id)
    db.session.add(enrollment)
    db.session.commit()
    
    flash('Successfully enrolled in class!')
    return redirect(url_for('student_dashboard'))

@app.route('/live_class/<int:class_id>')
def live_class(class_id):
    if 'user_id' not in session:
        return redirect(url_for('index'))
    
    class_obj = Class.query.get_or_404(class_id)
    
    # Check if user is authorized (teacher or enrolled student)
    authorized = False
    if session.get('role') == 'teacher' and class_obj.teacher_id == session['user_id']:
        authorized = True
    elif session.get('role') == 'student':
        enrollment = Enrollment.query.filter_by(student_id=session['user_id'], class_id=class_id).first()
        if enrollment:
            authorized = True
    
    if not authorized:
        flash('You are not authorized to access this class!')
        return redirect(url_for('index'))
    
    return render_template('live_class.html', class_obj=class_obj)

@app.route('/start_class/<int:class_id>')
def start_class(class_id):
    if 'user_id' not in session or session.get('role') != 'teacher':
        return redirect(url_for('index'))
    
    class_obj = Class.query.get_or_404(class_id)
    
    if class_obj.teacher_id != session['user_id']:
        flash('You are not authorized to start this class!')
        return redirect(url_for('teacher_dashboard'))
    
    class_obj.status = 'live'
    class_obj.is_live = True
    db.session.commit()
    
    return redirect(url_for('live_class', class_id=class_id))

@app.route('/materials/<int:class_id>')
def materials(class_id):
    if 'user_id' not in session:
        return redirect(url_for('index'))
    
    class_obj = Class.query.get_or_404(class_id)
    materials_list = Material.query.filter_by(class_id=class_id).all()
    
    # Check authorization
    authorized = False
    if session.get('role') == 'teacher' and class_obj.teacher_id == session['user_id']:
        authorized = True
    elif session.get('role') == 'student':
        enrollment = Enrollment.query.filter_by(student_id=session['user_id'], class_id=class_id).first()
        if enrollment:
            authorized = True
    
    if not authorized:
        flash('You are not authorized to access these materials!')
        return redirect(url_for('index'))
    
    return render_template('materials.html', class_obj=class_obj, materials=materials_list)

@app.route('/upload_material/<int:class_id>', methods=['POST'])
def upload_material(class_id):
    if 'user_id' not in session or session.get('role') != 'teacher':
        return redirect(url_for('index'))
    
    class_obj = Class.query.get_or_404(class_id)
    
    if class_obj.teacher_id != session['user_id']:
        flash('You are not authorized to upload materials for this class!')
        return redirect(url_for('teacher_dashboard'))
    
    if 'file' not in request.files:
        flash('No file selected')
        return redirect(url_for('materials', class_id=class_id))
    
    file = request.files['file']
    title = request.form['title']
    description = request.form['description']
    
    if file.filename == '':
        flash('No file selected')
        return redirect(url_for('materials', class_id=class_id))
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Add timestamp to avoid conflicts
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
        material = Material(
            title=title,
            description=description,
            filename=filename,
            file_type=file.filename.rsplit('.', 1)[1].lower(),
            class_id=class_id
        )
        
        db.session.add(material)
        db.session.commit()
        
        flash('Material uploaded successfully!')
    else:
        flash('Invalid file type')
    
    return redirect(url_for('materials', class_id=class_id))

@app.route('/download/<filename>')
def download_file(filename):
    if 'user_id' not in session:
        return redirect(url_for('index'))
    
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/schedule')
def schedule():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    
    if session.get('role') == 'teacher':
        classes = Class.query.filter_by(teacher_id=session['user_id']).order_by(Class.scheduled_time).all()
    else:
        enrollments = Enrollment.query.filter_by(student_id=session['user_id']).all()
        classes = [e.class_ref for e in enrollments]
        classes.sort(key=lambda x: x.scheduled_time)
    
    return render_template('schedule.html', classes=classes)
