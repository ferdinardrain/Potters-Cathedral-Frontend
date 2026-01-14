import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import './forgotPassword.css';

const ForgotPassword = () => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resetToken, setResetToken] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await apiClient.post('/api/auth/forgot-password', { username });
            setResetToken(data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(resetToken);
        alert('Reset token copied to clipboard!');
    };

    const goToReset = () => {
        navigate(`/reset-password?token=${resetToken}`);
    };

    if (resetToken) {
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
                                <img src="/church-logo.png" alt="Potter's Cathedral Logo" />
                            </div>
                            <h1 className="forgot-password__title">Reset Token Generated</h1>
                            <p className="forgot-password__subtitle">Use this token to reset your password</p>
                        </div>

                        <div className="forgot-password__token-display">
                            <label className="forgot-password__label">Your Reset Token:</label>
                            <div className="forgot-password__token-box">
                                <code className="forgot-password__token-code">{resetToken}</code>
                                <button
                                    type="button"
                                    className="forgot-password__copy-btn"
                                    onClick={copyToClipboard}
                                    title="Copy to clipboard"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                </button>
                            </div>
                            <p className="forgot-password__token-hint">
                                This token will expire in 1 hour. Keep it secure and don't share it with anyone.
                            </p>
                        </div>

                        <button
                            className="forgot-password__button"
                            onClick={goToReset}
                        >
                            Continue to Reset Password
                        </button>

                        <div className="forgot-password__footer">
                            <Link to="/login" className="forgot-password__link">
                                Back to Login
                            </Link>
                        </div>
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
                            <img src="/church-logo.png" alt="Potter's Cathedral Logo" />
                        </div>
                        <h1 className="forgot-password__title">Forgot Password?</h1>
                        <p className="forgot-password__subtitle">Enter your username to reset your password</p>
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
                            <label htmlFor="username" className="forgot-password__label">Username</label>
                            <input
                                id="username"
                                type="text"
                                className="forgot-password__input"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            className="forgot-password__button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="forgot-password__spinner"></span>
                                    Requesting Reset...
                                </>
                            ) : (
                                'Request Password Reset'
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

export default ForgotPassword;
