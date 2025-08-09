// Main JavaScript for EduStream - Modern Online Teaching Platform
// Handles interactive functionality, theme management, and user experience enhancements

document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeModals();
    initializeNavigation();
    initializeAnimations();
    initializeFormValidation();
    initializeNotifications();
    
    // Initialize demo accounts if on login page
    if (document.querySelector('.auth-section')) {
        createDemoAccounts();
    }
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('edustream-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        updateThemeIcon(savedTheme);
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('edustream-theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Add smooth transition effect
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

function updateThemeIcon(theme) {
    const themeToggle = document.querySelector('.theme-toggle i');
    if (themeToggle) {
        themeToggle.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Modal Management
function initializeModals() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="flex"]');
            openModals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
    
    // Prevent modal close when clicking inside modal content
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

// Navigation Enhancement
function initializeNavigation() {
    // Active link highlighting
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
    
    // Mobile menu toggle (for smaller screens)
    const navToggle = document.createElement('button');
    navToggle.className = 'nav-toggle';
    navToggle.innerHTML = '<i class="fas fa-bars"></i>';
    navToggle.style.display = 'none';
    
    const navContainer = document.querySelector('.nav-container');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navContainer && navMenu) {
        navContainer.insertBefore(navToggle, navMenu);
        
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('mobile-open');
        });
        
        // Show mobile toggle on small screens
        function checkScreenSize() {
            if (window.innerWidth <= 768) {
                navToggle.style.display = 'block';
            } else {
                navToggle.style.display = 'none';
                navMenu.classList.remove('mobile-open');
            }
        }
        
        window.addEventListener('resize', checkScreenSize);
        checkScreenSize();
    }
}

// Animation Enhancements
function initializeAnimations() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe cards and sections
    document.querySelectorAll('.class-card, .stat-card, .material-card, .section').forEach(el => {
        observer.observe(el);
    });
    
    // Add CSS for fade-in animation
    if (!document.querySelector('#fade-in-styles')) {
        const fadeInStyles = document.createElement('style');
        fadeInStyles.id = 'fade-in-styles';
        fadeInStyles.textContent = `
            .class-card, .stat-card, .material-card, .section {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            .fade-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(fadeInStyles);
    }
}

// Form Validation Enhancement
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
        
        // Form submission validation
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        }
    }
    
    // Password validation
    if (field.type === 'password' && value) {
        if (value.length < 6) {
            isValid = false;
            message = 'Password must be at least 6 characters long';
        }
    }
    
    // Date validation
    if (field.type === 'datetime-local' && value) {
        const selectedDate = new Date(value);
        const now = new Date();
        if (selectedDate <= now) {
            isValid = false;
            message = 'Please select a future date and time';
        }
    }
    
    // File validation
    if (field.type === 'file' && field.files.length > 0) {
        const file = field.files[0];
        const maxSize = 16 * 1024 * 1024; // 16MB
        
        if (file.size > maxSize) {
            isValid = false;
            message = 'File size must be less than 16MB';
        }
    }
    
    if (!isValid) {
        showFieldError(field, message);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function validateForm(form) {
    const fields = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isFormValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    
    return isFormValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Notification System
function initializeNotifications() {
    // Add styles for field errors
    if (!document.querySelector('#validation-styles')) {
        const validationStyles = document.createElement('style');
        validationStyles.id = 'validation-styles';
        validationStyles.textContent = `
            .form-group input.error,
            .form-group textarea.error,
            .form-group select.error {
                border-color: var(--danger-color);
                box-shadow: 0 0 0 3px rgba(250, 112, 154, 0.1);
            }
            .field-error {
                color: var(--danger-color);
                font-size: var(--font-size-sm);
                margin-top: var(--spacing-xs);
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
            }
            .field-error::before {
                content: "⚠";
                font-size: var(--font-size-xs);
            }
        `;
        document.head.appendChild(validationStyles);
    }
    
    // Auto-hide flash messages
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });
}

// Demo Account Creation
function createDemoAccounts() {
    // This simulates the creation of demo accounts
    // In a real application, these would be created server-side
    console.log('Demo accounts available:');
    console.log('Teacher: username="teacher_demo", password="demo123"');
    console.log('Student: username="student_demo", password="demo123"');
    
    // Store demo account info for quick access
    window.demoAccounts = {
        teacher: { username: 'teacher_demo', password: 'demo123' },
        student: { username: 'student_demo', password: 'demo123' }
    };
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Dashboard specific functions
function updateDashboardStats() {
    // This would typically fetch real-time stats
    // For now, it adds visual feedback to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'scale(1.02)';
            setTimeout(() => {
                card.style.transform = '';
            }, 200);
        }, index * 100);
    });
}

// Live class specific functions
function initializeLiveClass() {
    const liveClassContainer = document.querySelector('.live-class');
    if (!liveClassContainer) return;
    
    // Simulate periodic updates
    setInterval(() => {
        const indicator = document.querySelector('.stream-indicator span');
        if (indicator) {
            const messages = ['Broadcasting...', 'Live Stream...', 'Streaming HD...'];
            const currentText = indicator.textContent;
            const currentIndex = messages.indexOf(currentText);
            const nextIndex = (currentIndex + 1) % messages.length;
            indicator.textContent = messages[nextIndex];
        }
    }, 3000);
    
    // Initialize video controls
    const controlButtons = document.querySelectorAll('.control-btn');
    controlButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (this.classList.contains('end-call')) {
                if (confirm('Are you sure you want to end the class?')) {
                    showNotification('Class ended successfully', 'success');
                    // In a real app, this would redirect or update the class status
                }
                return;
            }
            
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            
            // Toggle microphone
            if (icon.classList.contains('fa-microphone')) {
                icon.className = this.classList.contains('active') ? 
                    'fas fa-microphone' : 'fas fa-microphone-slash';
            }
            
            // Toggle video
            if (icon.classList.contains('fa-video')) {
                icon.className = this.classList.contains('active') ? 
                    'fas fa-video' : 'fas fa-video-slash';
            }
        });
    });
}

// Materials page specific functions
function initializeMaterials() {
    const materialsPage = document.querySelector('.materials-page');
    if (!materialsPage) return;
    
    // File upload drag and drop
    const fileUpload = document.querySelector('.file-upload');
    if (fileUpload) {
        const fileInput = fileUpload.querySelector('input[type="file"]');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileUpload.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            fileUpload.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            fileUpload.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight(e) {
            fileUpload.classList.add('drag-highlight');
        }
        
        function unhighlight(e) {
            fileUpload.classList.remove('drag-highlight');
        }
        
        fileUpload.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                fileInput.files = files;
                updateFileDisplay(files[0]);
            }
        }
        
        function updateFileDisplay(file) {
            const display = fileUpload.querySelector('.file-upload-display span');
            if (display) {
                display.textContent = `${file.name} (${formatFileSize(file.size)})`;
            }
        }
        
        // Add drag highlight styles
        if (!document.querySelector('#drag-drop-styles')) {
            const dragStyles = document.createElement('style');
            dragStyles.id = 'drag-drop-styles';
            dragStyles.textContent = `
                .file-upload.drag-highlight {
                    border-color: var(--primary-color);
                    background: rgba(102, 126, 234, 0.05);
                    transform: scale(1.02);
                }
            `;
            document.head.appendChild(dragStyles);
        }
    }
}

// Initialize page-specific functionality
function initializePageSpecific() {
    // Initialize based on current page
    if (document.querySelector('.live-class')) {
        initializeLiveClass();
    }
    
    if (document.querySelector('.materials-page')) {
        initializeMaterials();
    }
    
    if (document.querySelector('.dashboard')) {
        setTimeout(updateDashboardStats, 500);
    }
}

// Call page-specific initialization
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializePageSpecific, 100);
});

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Application Error:', e.error);
    showNotification('An unexpected error occurred. Please try again.', 'error');
});

// Global utility functions available to all pages
window.EduStream = {
    showNotification,
    formatFileSize,
    formatDateTime,
    toggleTheme,
    updateDashboardStats
};

// Export functions for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeTheme,
        toggleTheme,
        validateField,
        validateForm,
        showNotification,
        formatFileSize,
        formatDateTime
    };
}
