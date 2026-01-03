// auth-ui.js
// Modern Authentication UI Module for Mizan

import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ===== MODAL MANAGEMENT =====
class AuthModal {
    constructor() {
        this.modal = null;
        this.currentTab = 'login';
        this.init();
    }

    init() {
        this.createModalHTML();
        this.attachEventListeners();
    }

    createModalHTML() {
        const modalHTML = `
            <div id="authModal" class="auth-modal-overlay" style="display: none;">
                <div class="auth-modal-container">
                    <button class="auth-modal-close" aria-label="Close modal">&times;</button>
                    
                    <div class="auth-modal-header">
                        <h2>Welcome to Mizan</h2>
                        <p>Sign in to your account or create a new one</p>
                    </div>

                    <!-- Tab Navigation -->
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">Sign In</button>
                        <button class="auth-tab" data-tab="signup">Sign Up</button>
                    </div>

                    <!-- Error/Success Messages -->
                    <div id="authMessage" class="auth-message" style="display: none;"></div>

                    <!-- Login Tab Content -->
                    <div id="loginTab" class="auth-tab-content active">
                        <form id="loginForm" class="auth-form">
                            <div class="auth-form-group">
                                <label for="loginEmail">Email Address</label>
                                <input 
                                    type="email" 
                                    id="loginEmail" 
                                    class="auth-input"
                                    placeholder="Enter your email"
                                    required
                                    autocomplete="email"
                                >
                            </div>
                            <div class="auth-form-group">
                                <label for="loginPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="loginPassword" 
                                    class="auth-input"
                                    placeholder="Enter your password"
                                    required
                                    autocomplete="current-password"
                                >
                            </div>
                            <button type="submit" class="auth-button" id="loginBtn">
                                Sign In
                            </button>
                        </form>
                    </div>

                    <!-- Sign Up Tab Content -->
                    <div id="signupTab" class="auth-tab-content">
                        <form id="signupForm" class="auth-form">
                            <div class="auth-form-group">
                                <label for="signupEmail">Email Address</label>
                                <input 
                                    type="email" 
                                    id="signupEmail" 
                                    class="auth-input"
                                    placeholder="Enter your email"
                                    required
                                    autocomplete="email"
                                >
                            </div>
                            <div class="auth-form-group">
                                <label for="signupPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="signupPassword" 
                                    class="auth-input"
                                    placeholder="Create a password (min. 6 characters)"
                                    required
                                    autocomplete="new-password"
                                    minlength="6"
                                >
                                <small class="auth-hint">Password must be at least 6 characters</small>
                            </div>
                            <div class="auth-form-group">
                                <label for="signupPasswordConfirm">Confirm Password</label>
                                <input 
                                    type="password" 
                                    id="signupPasswordConfirm" 
                                    class="auth-input"
                                    placeholder="Confirm your password"
                                    required
                                    autocomplete="new-password"
                                    minlength="6"
                                >
                            </div>
                            <button type="submit" class="auth-button" id="signupBtn">
                                Create Account
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('authModal');
    }

    attachEventListeners() {
        // Close modal events
        const closeBtn = this.modal.querySelector('.auth-modal-close');
        closeBtn.addEventListener('click', () => this.close());
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Tab switching
        const tabs = this.modal.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Form submissions
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display !== 'none') {
                this.close();
            }
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        const tabs = this.modal.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        const loginTab = document.getElementById('loginTab');
        const signupTab = document.getElementById('signupTab');
        
        if (tabName === 'login') {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
        } else {
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
        }

        // Clear messages when switching tabs
        this.hideMessage();
    }

    show() {
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        this.hideMessage();
        // Reset forms
        document.getElementById('loginForm')?.reset();
        document.getElementById('signupForm')?.reset();
    }

    showMessage(text, type = 'error') {
        const messageEl = document.getElementById('authMessage');
        messageEl.textContent = text;
        messageEl.className = `auth-message auth-message-${type}`;
        messageEl.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => this.hideMessage(), 3000);
        }
    }

    hideMessage() {
        const messageEl = document.getElementById('authMessage');
        messageEl.style.display = 'none';
    }

    async handleLogin(e) {
        e.preventDefault();
        this.hideMessage();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const loginBtn = document.getElementById('loginBtn');

        if (!email || !password) {
            this.showMessage('Please fill in all fields.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = 'Signing in...';

        try {
            await signInWithEmailAndPassword(auth, email, password);
            this.showMessage('Sign in successful!', 'success');
            setTimeout(() => {
                this.close();
                this.updateAuthUI();
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage(this.getErrorMessage(error.code), 'error');
            loginBtn.disabled = false;
            loginBtn.textContent = 'Sign In';
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        this.hideMessage();

        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
        const signupBtn = document.getElementById('signupBtn');

        // Validation
        if (!email || !password || !passwordConfirm) {
            this.showMessage('Please fill in all fields.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return;
        }

        // Password validation
        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long.', 'error');
            return;
        }

        // Password match validation
        if (password !== passwordConfirm) {
            this.showMessage('Passwords do not match.', 'error');
            return;
        }

        signupBtn.disabled = true;
        signupBtn.textContent = 'Creating account...';

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            this.showMessage('Account created successfully!', 'success');
            setTimeout(() => {
                this.close();
                this.updateAuthUI();
            }, 1000);
        } catch (error) {
            console.error('Signup error:', error);
            this.showMessage(this.getErrorMessage(error.code), 'error');
            signupBtn.disabled = false;
            signupBtn.textContent = 'Create Account';
        }
    }

    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Wrong password. Please try again.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/invalid-credential': 'Invalid email or password.',
            'auth/email-already-in-use': 'This email is already registered.',
            'auth/weak-password': 'Password is too weak. Please use a stronger password.',
            'auth/operation-not-allowed': 'This operation is not allowed.',
        };
        return errorMessages[errorCode] || 'An error occurred. Please try again.';
    }

    updateAuthUI() {
        // This will be called by the main auth manager
        if (window.authManager) {
            window.authManager.updateUI();
        }
    }
}

// ===== AUTH MANAGER =====
class AuthManager {
    constructor() {
        this.user = null;
        this.modal = null;
        this.userIcon = null;
        this.userDropdown = null;
        this.init();
    }

    init() {
        this.modal = new AuthModal();
        this.createUserIcon();
        this.setupAuthStateListener();
    }

    createUserIcon() {
        // Find the nav-cta div and add user icon inside it
        const navCta = document.querySelector('.nav-cta');
        if (!navCta) return;

        // Create user icon container
        const userIconContainer = document.createElement('div');
        userIconContainer.className = 'user-icon-container';
        userIconContainer.innerHTML = `
            <button class="user-icon-btn" id="userIconBtn" aria-label="Account">
                <svg class="user-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="user-icon-tooltip">Sign In / Sign Up</span>
            </button>
            <div class="user-dropdown" id="userDropdown" style="display: none;">
                <div class="user-dropdown-header">
                    <div class="user-email" id="userEmail"></div>
                </div>
                <div class="user-dropdown-divider"></div>
                <a href="#" class="user-dropdown-item" id="profileLink">Profile</a>
                <a href="#" class="user-dropdown-item" id="settingsLink">Settings</a>
                <div class="user-dropdown-divider"></div>
                <button class="user-dropdown-item user-dropdown-logout" id="logoutBtn">Logout</button>
            </div>
        `;

        // Append to nav-cta (which already has flex display)
        navCta.appendChild(userIconContainer);
        
        this.userIcon = document.getElementById('userIconBtn');
        this.userDropdown = document.getElementById('userDropdown');

        // Attach event listeners
        this.userIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.user) {
                // Toggle dropdown
                const isVisible = this.userDropdown.style.display !== 'none';
                this.userDropdown.style.display = isVisible ? 'none' : 'block';
            } else {
                // Open auth modal
                this.modal.show();
            }
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userIconContainer.contains(e.target)) {
                this.userDropdown.style.display = 'none';
            }
        });
    }

    setupAuthStateListener() {
        onAuthStateChanged(auth, (user) => {
            this.user = user;
            this.updateUI();
        });
    }

    updateUI() {
        if (this.user) {
            // User is logged in
            const userEmail = document.getElementById('userEmail');
            if (userEmail) {
                userEmail.textContent = this.user.email || 'User';
            }
            
            // Update tooltip
            const tooltip = this.userIcon?.querySelector('.user-icon-tooltip');
            if (tooltip) {
                tooltip.textContent = 'Account';
            }
        } else {
            // User is not logged in
            const tooltip = this.userIcon?.querySelector('.user-icon-tooltip');
            if (tooltip) {
                tooltip.textContent = 'Sign In / Sign Up';
            }
        }
    }

    async handleLogout() {
        try {
            await signOut(auth);
            this.userDropdown.style.display = 'none';
            this.modal.showMessage('Logged out successfully.', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            this.modal.showMessage('Error logging out. Please try again.', 'error');
        }
    }
}

// Initialize auth manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authManager = new AuthManager();
    });
} else {
    window.authManager = new AuthManager();
}

export { AuthManager, AuthModal };

