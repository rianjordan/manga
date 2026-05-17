/* ═══════════════════════════════════════════════════════════
   Reader's Haven — Authentication Logic
   auth.js
   Handles both login.html and signup.html
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── THEME INITIALIZATION ───
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-mode');
    }

    // ─── PASSWORD VISIBILITY TOGGLE ───
    const toggleBtn = document.getElementById('toggle-password');
    if (toggleBtn) {
        // Find the password input in the same container
        const passwordInput = toggleBtn.closest('.relative').querySelector('input[type="password"], input[type="text"]');
        if (passwordInput) {
            toggleBtn.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
                }
            });
        }
    }


    // ═══════════════════════════════════════════════════
    // SIGNUP LOGIC
    // ═══════════════════════════════════════════════════
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {

        // Password strength indicator
        const signupPassword = document.getElementById('signup-password');
        const strBars = [
            document.getElementById('str-1'),
            document.getElementById('str-2'),
            document.getElementById('str-3'),
            document.getElementById('str-4')
        ];

        if (signupPassword && strBars[0]) {
            signupPassword.addEventListener('input', () => {
                const val = signupPassword.value;
                let strength = 0;

                if (val.length >= 6) strength++;
                if (val.length >= 10) strength++;
                if (/[A-Z]/.test(val) && /[a-z]/.test(val)) strength++;
                if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) strength++;

                const classes = ['strength-weak', 'strength-fair', 'strength-good', 'strength-strong'];

                strBars.forEach((bar, i) => {
                    // Reset
                    bar.className = 'h-1 flex-1 rounded-full bg-gray-700 transition-all duration-300';
                    if (i < strength) {
                        bar.classList.add(classes[Math.min(strength - 1, 3)]);
                    }
                });
            });
        }

        // Form submission
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('signup-username');
            const email = document.getElementById('signup-email');
            const countryCode = document.getElementById('signup-country-code');
            const phone = document.getElementById('signup-phone');
            const password = document.getElementById('signup-password');
            const confirm = document.getElementById('signup-confirm');
            const terms = document.getElementById('signup-terms');

            // Validation
            if (!username.value.trim()) {
                showAlert('Please enter a username.');
                username.focus();
                return;
            }

            if (!email.value.trim() || !isValidEmail(email.value)) {
                showAlert('Please enter a valid email address.');
                email.focus();
                return;
            }

            if (countryCode && !countryCode.value.trim()) {
                showAlert('Please enter your country code (e.g. +855).');
                countryCode.focus();
                return;
            }

            if (phone && !phone.value.trim()) {
                showAlert('Please enter your mobile number.');
                phone.focus();
                return;
            }

            if (password.value.length < 6) {
                showAlert('Password must be at least 6 characters.');
                password.focus();
                return;
            }

            if (password.value !== confirm.value) {
                showAlert('Passwords do not match.');
                confirm.focus();
                return;
            }

            if (terms && !terms.checked) {
                showAlert('Please agree to the Terms of Service.');
                return;
            }

            // Save to localStorage
            const userData = {
                username: username.value.trim(),
                email: email.value.trim().toLowerCase(),
                countryCode: countryCode ? countryCode.value.trim() : '',
                phone: phone ? phone.value.trim() : '',
                password: password.value
            };

            localStorage.setItem('rh_user', JSON.stringify(userData));

            // Show success and redirect
            showAlert('Account created successfully! Redirecting to login...', 'success');

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }


    // ═══════════════════════════════════════════════════
    // LOGIN LOGIC
    // ═══════════════════════════════════════════════════
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email');
            const password = document.getElementById('login-password');

            // Validation
            if (!email.value.trim() || !isValidEmail(email.value)) {
                showAlert('Please enter a valid email address.');
                email.focus();
                return;
            }

            if (!password.value) {
                showAlert('Please enter your password.');
                password.focus();
                return;
            }

            // Check against localStorage
            const stored = localStorage.getItem('rh_user');

            if (!stored) {
                showAlert('No account found. Please sign up first.');
                return;
            }

            const userData = JSON.parse(stored);

            if (email.value.trim().toLowerCase() === userData.email && password.value === userData.password) {
                // Success
                localStorage.setItem('rh_logged_in', 'true');
                showAlert('Login successful! Redirecting...', 'success');

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1200);
            } else {
                showAlert('Invalid email or password. Please try again.');
            }
        });


        // ═══════════════════════════════════════════════════
        // FORGOT PASSWORD FLOW (3-Step Overlay)
        // ═══════════════════════════════════════════════════

        const forgotLink = document.getElementById('forgot-password-link');
        const forgotOverlay = document.getElementById('forgot-overlay');
        const codeOverlay = document.getElementById('code-overlay');
        const resetOverlay = document.getElementById('reset-overlay');

        // Helper to show/hide overlays
        function showOverlay(overlay) {
            if (!overlay) return;
            overlay.classList.remove('opacity-0', 'invisible');
            overlay.classList.add('opacity-100', 'visible');
        }

        function hideOverlay(overlay) {
            if (!overlay) return;
            overlay.classList.remove('opacity-100', 'visible');
            overlay.classList.add('opacity-0', 'invisible');
        }

        function hideAllOverlays() {
            [forgotOverlay, codeOverlay, resetOverlay].forEach(o => hideOverlay(o));
        }

        // Open forgot password (Step 1)
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                hideAllOverlays();
                showOverlay(forgotOverlay);
            });
        }

        // Close buttons & back buttons
        const forgotClose = document.getElementById('forgot-close');
        const forgotBackBtn = document.getElementById('forgot-back-to-login');
        const codeClose = document.getElementById('code-close');
        const codeBackBtn = document.getElementById('code-back-to-email');
        const resetClose = document.getElementById('reset-close');
        const resetBackBtn = document.getElementById('reset-back-to-login');

        if (forgotClose) forgotClose.addEventListener('click', hideAllOverlays);
        if (forgotBackBtn) forgotBackBtn.addEventListener('click', hideAllOverlays);
        if (codeClose) codeClose.addEventListener('click', hideAllOverlays);
        if (codeBackBtn) {
            codeBackBtn.addEventListener('click', () => {
                hideAllOverlays();
                showOverlay(forgotOverlay);
            });
        }
        if (resetClose) resetClose.addEventListener('click', hideAllOverlays);
        if (resetBackBtn) resetBackBtn.addEventListener('click', hideAllOverlays);

        // Step 1: Submit email → go to Step 2
        const forgotEmailForm = document.getElementById('forgot-email-form');
        if (forgotEmailForm) {
            forgotEmailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const forgotEmail = document.getElementById('forgot-email');

                if (!forgotEmail.value.trim() || !isValidEmail(forgotEmail.value)) {
                    showAlert('Please enter a valid email address.');
                    forgotEmail.focus();
                    return;
                }

                // Check if email exists in localStorage
                const stored = localStorage.getItem('rh_user');
                if (stored) {
                    const userData = JSON.parse(stored);
                    if (forgotEmail.value.trim().toLowerCase() !== userData.email) {
                        showAlert('No account found with this email.');
                        return;
                    }
                } else {
                    showAlert('No account found. Please sign up first.');
                    return;
                }

                // Process sending code
                const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
                localStorage.setItem('rh_reset_code', mockCode);
                localStorage.setItem('rh_reset_email', forgotEmail.value.trim().toLowerCase());

                showAlert(`Verification code sent! (Security Code: ${mockCode})`, 'success');

                // Move to Step 2
                setTimeout(() => {
                    hideAllOverlays();
                    showOverlay(codeOverlay);
                }, 1200);
            });
        }

        // Step 2: Verify code → go to Step 3
        const codeVerifyForm = document.getElementById('code-verify-form');
        if (codeVerifyForm) {
            codeVerifyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const codeInput = document.getElementById('verify-code');
                const storedCode = localStorage.getItem('rh_reset_code');

                if (!codeInput.value.trim()) {
                    showAlert('Please enter the 6-digit code.');
                    codeInput.focus();
                    return;
                }

                if (codeInput.value.trim() !== storedCode) {
                    showAlert('Invalid code. Please check and try again.');
                    codeInput.focus();
                    return;
                }

                showAlert('Code verified successfully!', 'success');

                // Move to Step 3
                setTimeout(() => {
                    hideAllOverlays();
                    showOverlay(resetOverlay);
                }, 1000);
            });
        }

        // Step 3: Reset password → close and return to login
        const resetPasswordForm = document.getElementById('reset-password-form');
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newPw = document.getElementById('new-password');
                const confirmPw = document.getElementById('confirm-new-password');

                if (newPw.value.length < 6) {
                    showAlert('Password must be at least 6 characters.');
                    newPw.focus();
                    return;
                }

                if (newPw.value !== confirmPw.value) {
                    showAlert('Passwords do not match.');
                    confirmPw.focus();
                    return;
                }

                // Update password in localStorage
                const stored = localStorage.getItem('rh_user');
                if (stored) {
                    const userData = JSON.parse(stored);
                    userData.password = newPw.value;
                    localStorage.setItem('rh_user', JSON.stringify(userData));
                }

                // Clean up reset tokens
                localStorage.removeItem('rh_reset_code');
                localStorage.removeItem('rh_reset_email');

                showAlert('Password reset successfully! Please log in with your new password.', 'success');

                setTimeout(() => {
                    hideAllOverlays();
                    newPw.value = '';
                    confirmPw.value = '';
                }, 1500);
            });
        }
    }


    // ═══════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showAlert(message, type = 'error') {
        // Remove any existing alert
        const existing = document.querySelector('.auth-alert');
        if (existing) existing.remove();

        // Create alert element
        const alert = document.createElement('div');
        alert.className = 'auth-alert';

        const bgColor = type === 'success' ? 'rgba(214, 51, 108, 0.15)' : 'rgba(239, 68, 68, 0.15)';
        const borderColor = type === 'success' ? 'rgba(214, 51, 108, 0.3)' : 'rgba(239, 68, 68, 0.3)';
        const textColor = type === 'success' ? '#D6336C' : '#f87171';
        const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';

        alert.style.cssText = `
            position: fixed;
            top: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(-20px);
            background: ${bgColor};
            border: 1px solid ${borderColor};
            color: ${textColor};
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            backdrop-filter: blur(12px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            opacity: 0;
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            max-width: 90vw;
        `;

        alert.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
        document.body.appendChild(alert);

        // Animate in
        requestAnimationFrame(() => {
            alert.style.opacity = '1';
            alert.style.transform = 'translateX(-50%) translateY(0)';
        });

        // Auto dismiss
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => alert.remove(), 350);
        }, 3500);
    }
    // --- 7. PAGE TRANSITIONS ---
    document.body.classList.add('loaded');

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) document.body.classList.remove('fade-out');
    });

    document.querySelectorAll('a').forEach(link => {
        const isInternal = link.hostname === window.location.hostname || !link.hostname;
        const isSamePage = link.getAttribute('href')?.startsWith('#');
        const isTargetBlank = link.target === '_blank';

        if (isInternal && !isSamePage && !isTargetBlank) {
            link.addEventListener('click', (e) => {
                if (e.metaKey || e.ctrlKey) return;
                e.preventDefault();
                const destination = link.href;
                document.body.classList.add('fade-out');
                setTimeout(() => { window.location.href = destination; }, 400);
            });
        }
    });
});



