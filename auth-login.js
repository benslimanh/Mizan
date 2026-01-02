// auth-login.js
// Import auth from firebase-config.js
import { auth } from './firebase-config.js';
// Import signInWithEmailAndPassword from Firebase Auth
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Get DOM elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signInBtn = document.getElementById('signInBtn');
const errorMessage = document.getElementById('errorMessage');

// Helper function to show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// Helper function to hide error message
function hideError() {
    errorMessage.classList.remove('show');
}

// Helper function to get user-friendly error messages
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/user-not-found':
            return 'No account found with this email address.';
        case 'auth/wrong-password':
            return 'Wrong password. Please try again.';
        case 'auth/invalid-email':
            return 'Invalid email address. Please check and try again.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection and try again.';
        case 'auth/invalid-credential':
            return 'Invalid email or password. Please try again.';
        default:
            return 'An error occurred. Please try again.';
    }
}

// Add event listener to login form
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validate inputs
        if (!email || !password) {
            showError('Please fill in all fields.');
            return;
        }
        
        // Disable button and show loading state
        signInBtn.disabled = true;
        signInBtn.textContent = 'Signing in...';
        loginForm.classList.add('loading');
        
        try {
            // Attempt to sign in
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Success - user is signed in
            console.log('Sign in successful:', userCredential.user);
            
            // Redirect to index.html
            window.location.href = 'index.html';
            
        } catch (error) {
            // Handle errors
            console.error('Sign in error:', error);
            const errorMsg = getErrorMessage(error.code);
            showError(errorMsg);
            
            // Re-enable button
            signInBtn.disabled = false;
            signInBtn.textContent = 'Sign In';
            loginForm.classList.remove('loading');
        }
    });
}


