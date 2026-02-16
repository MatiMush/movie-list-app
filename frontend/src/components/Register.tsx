import React, { useState, useContext } from 'react';
import '../styles/Auth.css';
import { AuthContext } from '../context/AuthContext';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext)!;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        try {
            await register(email, password);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrarse');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>🎬 Crear Cuenta</h1>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Contraseña:</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Confirmar Contraseña:</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    <button type="submit">Registrarse</button>
                </form>
                <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a></p>
            </div>
        </div>
    );
};

export default Register;