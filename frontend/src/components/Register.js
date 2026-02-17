import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useContext } from 'react';
import '../styles/Auth.css';
import { AuthContext } from '../context/AuthContext';
const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        try {
            await register(email, password);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Error al registrarse');
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsx("h1", { children: "\uD83C\uDFAC Crear Cuenta" }), error && _jsx("p", { className: "error", children: error }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email:" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Contrase\u00F1a:" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Confirmar Contrase\u00F1a:" }), _jsx("input", { type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true })] }), _jsx("button", { type: "submit", children: "Registrarse" })] }), _jsxs("p", { children: ["\u00BFYa tienes cuenta? ", _jsx("a", { href: "/login", children: "Inicia sesi\u00F3n aqu\u00ED" })] })] }) }));
};
export default Register;
