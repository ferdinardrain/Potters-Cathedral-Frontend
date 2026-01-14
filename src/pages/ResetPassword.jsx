import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './forgotPassword.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(searchParams.get('token') || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            setSuccess(true);
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="forgot-password">
                <div className="forgot-password__background">
                    <div className="forgot-password__gradient forgot-password__gradient--1"></div>
                    <div className="forgot-password__gradient forgot-password__gradient--2"></div>
                    <div className="forgot-password__gradient forgot-password__gradient--3"></div>
                </div>

                <div className="forgot-password__container">
                    <div className="forgot-password__card">
                        <div className="forgot-password__header">
                            <div className="forgot-password__icon">
                                <img src="/logo.jpg" alt="Potter's Cathedral Logo" />
                            </div>
                            <h1 className="forgot-password__title">Password Reset Successful!</h1>
                            <p className="forgot-password__subtitle">Redirecting you to login...</p>
                        </div>

                        <div className="forgot-password__success">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <p>Your password has been reset successfully. You can now log in with your new password.</p>
                        </div>

                        <Link to="/login" className="forgot-password__button">
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="forgot-password">
            <div className="forgot-password__background">
                <div className="forgot-password__gradient forgot-password__gradient--1"></div>
                <div className="forgot-password__gradient forgot-password__gradient--2"></div>
                <div className="forgot-password__gradient forgot-password__gradient--3"></div>
            </div>

            <div className="forgot-password__container">
                <div className="forgot-password__card">
                    <div className="forgot-password__header">
                        <div className="forgot-password__icon">
                            <img src="/logo.jpg" alt="Potter's Cathedral Logo" />
                        </div>
                        <h1 className="forgot-password__title">Reset Password</h1>
                        <p className="forgot-password__subtitle">Enter your reset token and new password</p>
                    </div>

                    <form className="forgot-password__form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="forgot-password__error">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="forgot-password__field">
                            <label htmlFor="token" className="forgot-password__label">Reset Token</label>
                            <input
                                id="token"
                                type="text"
                                className="forgot-password__input"
                                placeholder="Enter your reset token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                required
                                autoFocus={!token}
                            />
                        </div>

                        <div className="forgot-password__field">
                            <label htmlFor="newPassword" className="forgot-password__label">New Password</label>
                            <div className="forgot-password__password-wrapper">
                                <input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    className="forgot-password__input forgot-password__input--password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="forgot-password__password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="forgot-password__field">
                            <label htmlFor="confirmPassword" className="forgot-password__label">Confirm Password</label>
                            <div className="forgot-password__password-wrapper">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="forgot-password__input forgot-password__input--password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="forgot-password__password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="forgot-password__button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="forgot-password__spinner"></span>
                                    Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    <div className="forgot-password__footer">
                        <Link to="/login" className="forgot-password__link">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
