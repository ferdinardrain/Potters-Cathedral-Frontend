import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { apiClient } from '../services/apiClient';
import Swal from 'sweetalert2';
import './login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Warm up the backend as soon as the login page loads
    // This wakes up Render's cold start while the user is typing
    useEffect(() => {
        apiClient.get('/').catch(() => {
            // Ignore errors, we just want to trigger a wake-up request
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Trim inputs to handle mobile auto-correct spaces
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();

        const result = await login(trimmedUsername, trimmedPassword);

        if (result.success) {
            await Swal.fire({
                title: 'Welcome Back!',
                text: 'Login Successful',
                icon: 'success',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            navigate('/overview');
        } else {
            setError(result.error);
            setIsLoading(false);
        }
    };

    return (
        <div className="login">
            <div className="login__background">
                <div className="login__gradient login__gradient--1"></div>
                <div className="login__gradient login__gradient--2"></div>
                <div className="login__gradient login__gradient--3"></div>
            </div>

            <div className="login__container">
                <div className="login__card">
                    <div className="login__header">
                        <div className="login__icon">
                            <img src="/church-logo.png" alt="Potter's Cathedral Logo" />
                        </div>
                        <h1 className="login__title">Potter's Cathedral</h1>
                        <p className="login__subtitle">Church International - Admin Portal</p>
                    </div>

                    <form className="login__form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="login__error">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="login__field">
                            <label htmlFor="username" className="login__label">Username</label>
                            <input
                                id="username"
                                type="text"
                                className="login__input"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                                autoCapitalize="none"
                                autoCorrect="off"
                                autoComplete="username"
                            />
                        </div>

                        <div className="login__field">
                            <label htmlFor="password" className="login__label">Password</label>
                            <div className="login__password-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="login__input login__input--password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="login__password-toggle"
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

                        <button
                            type="submit"
                            className="login__button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="login__spinner"></span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="login__footer">
                        <Link to="/forgot-password" className="login__link">
                            Forgot Password?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
