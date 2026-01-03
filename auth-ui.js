// auth-ui.js
// Modern Authentication UI Module for Mizan

import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    updatePassword,
    sendPasswordResetEmail,
    reauthenticateWithCredential,
    EmailAuthProvider
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Check email verification
            if (!user.emailVerified) {
                // Store user email before signing out
                const userEmail = user.email;
                
                // Sign out immediately if not verified
                await signOut(auth);
                
                // Show error message with resend option
                const messageEl = document.getElementById('authMessage');
                messageEl.innerHTML = `Email not verified. Please check your inbox or <a href="#" id="resendLoginVerification" style="color: var(--color-deep-teal); text-decoration: underline; cursor: pointer;">click here to resend</a>.`;
                messageEl.className = 'auth-message auth-message-error';
                messageEl.style.display = 'block';
                
                // Add resend verification handler
                setTimeout(() => {
                    const resendLink = document.getElementById('resendLoginVerification');
                    if (resendLink) {
                        resendLink.addEventListener('click', async (e) => {
                            e.preventDefault();
                            try {
                                // Re-sign in temporarily to send verification
                                const tempCred = await signInWithEmailAndPassword(auth, email, password);
                                await sendEmailVerification(tempCred.user);
                                await signOut(auth);
                                this.showMessage('Verification email sent! Please check your inbox.', 'success');
                            } catch (err) {
                                console.error('Resend verification error:', err);
                                this.showMessage('Error sending verification email. Please try again.', 'error');
                            }
                        });
                    }
                }, 100);
                
                loginBtn.disabled = false;
                loginBtn.textContent = 'Sign In';
                return;
            }
            
            // User is verified - allow access
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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Send email verification immediately
            await sendEmailVerification(user);
            
            // Sign out immediately after signup
            await signOut(auth);
            
            // Show success message with verification info
            this.showMessage(
                `Account created! A verification link has been sent to ${email}. Please check your inbox and verify your email before signing in.`,
                'success'
            );
            
            // Close modal after showing message
            setTimeout(() => {
                this.close();
                this.updateAuthUI();
            }, 5000);
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
            <button class="user-icon-btn" id="userIconBtn" aria-label="Account" style="display: none;">
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

        // Profile link
        const profileLink = document.getElementById('profileLink');
        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.userDropdown.style.display = 'none';
                this.showProfileModal();
            });
        }

        // Settings link
        const settingsLink = document.getElementById('settingsLink');
        if (settingsLink) {
            settingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.userDropdown.style.display = 'none';
                this.showSettingsModal();
            });
        }

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
        // Use onAuthStateChanged to manage UI state globally
        onAuthStateChanged(auth, (user) => {
            this.user = user;
            this.updateUI();
        });
    }

    updateUI() {
        if (!this.userIcon) return;
        
        if (this.user) {
            // User is logged in - show user icon, hide login icon
            this.userIcon.style.display = 'flex';
            
            const userEmail = document.getElementById('userEmail');
            if (userEmail) {
                userEmail.textContent = this.user.email || 'User';
            }
            
            // Update tooltip
            const tooltip = this.userIcon.querySelector('.user-icon-tooltip');
            if (tooltip) {
                tooltip.textContent = 'Account';
            }
        } else {
            // User is not logged in - show login icon
            this.userIcon.style.display = 'flex';
            
            // Update tooltip
            const tooltip = this.userIcon.querySelector('.user-icon-tooltip');
            if (tooltip) {
                tooltip.textContent = 'Sign In / Sign Up';
            }
            
            // Close dropdown if open
            if (this.userDropdown) {
                this.userDropdown.style.display = 'none';
            }
        }
    }

    showProfileModal() {
        if (!this.user) return;
        
        const modal = document.getElementById('profileModal');
        const email = document.getElementById('profileEmail');
        const uid = document.getElementById('profileUID');
        const created = document.getElementById('profileCreated');
        const statusText = document.getElementById('statusText');
        const statusIndicator = document.getElementById('statusIndicator');
        const resendContainer = document.getElementById('profileResendContainer');
        
        // Populate profile data
        email.textContent = this.user.email || '-';
        uid.textContent = this.user.uid || '-';
        
        // Format creation time
        if (this.user.metadata && this.user.metadata.creationTime) {
            const date = new Date(this.user.metadata.creationTime);
            created.textContent = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            created.textContent = '-';
        }
        
        // Email verification status
        if (this.user.emailVerified) {
            statusText.textContent = 'Verified';
            statusIndicator.className = 'status-indicator status-verified';
            resendContainer.style.display = 'none';
        } else {
            statusText.textContent = 'Unverified';
            statusIndicator.className = 'status-indicator status-unverified';
            resendContainer.style.display = 'block';
        }
        
        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Close button
        const closeBtn = document.getElementById('profileModalClose');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        };
        
        // Click outside to close
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        };
        
        // Resend verification
        const resendBtn = document.getElementById('resendVerificationBtn');
        if (resendBtn) {
            resendBtn.onclick = async () => {
                try {
                    await sendEmailVerification(this.user);
                    this.modal.showMessage('Verification email sent! Please check your inbox.', 'success');
                } catch (error) {
                    this.modal.showMessage('Error sending verification email. Please try again.', 'error');
                }
            };
        }
    }

    showSettingsModal() {
        if (!this.user) return;
        
        const modal = document.getElementById('settingsModal');
        const messageEl = document.getElementById('settingsMessage');
        
        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Close button
        const closeBtn = document.getElementById('settingsModalClose');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            messageEl.style.display = 'none';
            document.getElementById('changePasswordForm')?.reset();
        };
        
        // Click outside to close
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                messageEl.style.display = 'none';
            }
        };
        
        // Change password form
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.onsubmit = async (e) => {
                e.preventDefault();
                messageEl.style.display = 'none';
                
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmNewPassword').value;
                const changeBtn = document.getElementById('changePasswordBtn');
                
                // Validation
                if (newPassword.length < 6) {
                    this.showSettingsMessage('Password must be at least 6 characters long.', 'error');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    this.showSettingsMessage('New passwords do not match.', 'error');
                    return;
                }
                
                changeBtn.disabled = true;
                changeBtn.textContent = 'Updating...';
                
                try {
                    // Re-authenticate user
                    const credential = EmailAuthProvider.credential(this.user.email, currentPassword);
                    await reauthenticateWithCredential(this.user, credential);
                    
                    // Update password
                    await updatePassword(this.user, newPassword);
                    
                    this.showSettingsMessage('Password updated successfully!', 'success');
                    changePasswordForm.reset();
                } catch (error) {
                    console.error('Change password error:', error);
                    const errorMsg = this.getErrorMessage(error.code);
                    this.showSettingsMessage(errorMsg, 'error');
                } finally {
                    changeBtn.disabled = false;
                    changeBtn.textContent = 'Update Password';
                }
            };
        }
        
        // Reset password button
        const resetBtn = document.getElementById('resetPasswordBtn');
        if (resetBtn) {
            resetBtn.onclick = async () => {
                try {
                    await sendPasswordResetEmail(auth, this.user.email);
                    this.showSettingsMessage(`Password reset email sent to ${this.user.email}`, 'success');
                } catch (error) {
                    console.error('Reset password error:', error);
                    const errorMsg = this.getErrorMessage(error.code);
                    this.showSettingsMessage(errorMsg, 'error');
                }
            };
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
            'auth/requires-recent-login': 'Please sign out and sign in again before changing your password.',
        };
        return errorMessages[errorCode] || 'An error occurred. Please try again.';
    }

    showSettingsMessage(text, type = 'error') {
        const messageEl = document.getElementById('settingsMessage');
        messageEl.textContent = text;
        messageEl.className = `auth-message auth-message-${type}`;
        messageEl.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }

    async handleLogout() {
        try {
            await signOut(auth);
            this.userDropdown.style.display = 'none';
            // Reload page to reset UI state
            window.location.reload();
        } catch (error) {
            console.error('Logout error:', error);
            this.modal.showMessage('Error logging out. Please try again.', 'error');
        }
    }
}

// Initialize auth manager when DOM is ready
// Use a small delay to ensure DOM is fully ready and prevent flicker
function initAuthManager() {
    window.authManager = new AuthManager();
    // Initial UI update will happen via onAuthStateChanged
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Small delay to ensure all elements are ready
        setTimeout(initAuthManager, 50);
    });
} else {
    // DOM already loaded, but add small delay to prevent flicker
    setTimeout(initAuthManager, 50);
}

export { AuthManager, AuthModal };

