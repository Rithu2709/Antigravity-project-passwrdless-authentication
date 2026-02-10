import React, { useState } from 'react';
import ReactorLock from './components/ReactorLock';

const App = () => {
    // State to manage views: 'register', 'login', 'welcome'
    const [view, setView] = useState('login');

    // User data state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [angles, setAngles] = useState([0, 0, 0]);
    const [user, setUser] = useState(null);
    const [loginTime, setLoginTime] = useState(null);

    // Toast State
    const [toast, setToast] = useState({ show: false, msg: '', type: 'info' });

    const showToast = (msg, isError = false) => {
        setToast({ show: true, msg, type: isError ? 'error' : 'info' });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    // Use current backend connection
    const handleAuth = async () => {
        const endpoint = view === 'register' ? '/api/register' : '/api/login';

        try {
            const res = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name,email,angles })
            });

            const data = await res.json();
            console.log('API RESPONSE:', data);

            if (data.success) {
                if (view === 'register') {
                    showToast('User registered successfully');
                    const core = document.querySelector('.core');
                    if (core) core.classList.add('active');
                    setTimeout(() => {
                        if (core) core.classList.remove('active');
                        setView('login');
                    }, 1000);
                } else {
                    // Login Success
                    const core = document.querySelector('.core');
                    if (core) core.classList.add('active');
                    showToast('Login Success');
                    setUser({
                        email,
                        name: data.user.name || 'Operator'
                    });

                    setLoginTime(new Date());

                    setTimeout(() => {
                        if (core) core.classList.remove('active');
                        setView('welcome');
                    }, 800);
                }
            } else {
                console.error('Auth Error:', data);
                showToast(data.error || 'Authentication Failed', true);
                const core = document.querySelector('.core');
                if (core) {
                    core.style.borderColor = 'var(--neon-red)';
                    core.style.boxShadow = '0 0 20px var(--neon-red)';
                    setTimeout(() => {
                        core.style.borderColor = '#333';
                        core.style.boxShadow = 'none';
                    }, 1000);
                }
            }
        } catch (err) {
            console.error('Fetch Error:', err);
            showToast('Server Connection Error', true);
        }
    };

    const handleLogout = () => {
        setUser(null);
        setView('login');
        setAngles([0, 0, 0]);
    };
    const formatDateTime = (date) => {
        if (!date) return '—';
        return date.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };
    return (
        <div className="app-container">
            {/* Toast Notification */}
            <div
                className={`toast ${toast.show ? 'toast-show' : ''}`}
                style={{ borderColor: toast.type === 'error' ? 'var(--neon-red)' : '#555' }}
            >
                {toast.msg}
            </div>

            <div className="card">

                {/* --- REGISTER VIEW --- */}
                {view === 'register' && (
                    <div className="view view-active">
                        <h1>REGISTER</h1>
                        <p className="subtitle">Align the reactor rings to set your unique authentication.</p>

                        <input
                            type="text"
                            placeholder="Username"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Secure Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        {/* Reactor */}
                        <ReactorLock onSetAngles={setAngles} />

                        <button onClick={handleAuth}>Register</button>
                        <div className="link" onClick={() => setView('login')}>Existing Operator? Login</div>
                    </div>
                )}

                {/* --- LOGIN VIEW --- */}
                {view === 'login' && (
                    <div className="view view-active">
                        <h1>LOGIN</h1>
                        <p className="subtitle">Restore your authentication to login.</p>

                        <input
                            type="email"
                            placeholder="Secure Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <ReactorLock onSetAngles={setAngles} />

                        <button onClick={handleAuth}>VERIFY AUTHENTICATION</button>
                        <div className="link" onClick={() => setView('register')}>New Registration</div>
                    </div>
                )}

                {/* --- WELCOME VIEW --- */}
                {view === 'welcome' && (
                    <div className="view view-active">
                        <div className="core active" style={{ margin: '0 auto 20px auto', position: 'relative', top: 0, left: 0, transform: 'none' }}></div>
                        <h1>Passwordless Authentication</h1>
                        <p className="subtitle">System Online. Welcome back.</p>

                        <div className="profile-stat">
                            <span>Identity:</span>
                            <span style={{ color: 'var(--neon-blue)' }}>{user?.name || 'Unknown'}</span>
                        </div>
                        <div className="profile-stat">
                            <span>Login Time:</span>
                            <span style={{ color: 'var(--neon-green)' }}>
                                {formatDateTime(loginTime)}
                            </span>
                        </div>


                        <button onClick={handleLogout} style={{ marginTop: '20px' }}>TERMINATE SESSION</button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default App;
