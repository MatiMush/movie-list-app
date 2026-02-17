import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useContext } from 'react';
import '../styles/Auth.css';
import { AuthContext } from '../context/AuthContext';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsx("h1", { children: "\uD83C\uDFAC Iniciar Sesi\u00F3n" }), error && _jsx("p", { className: "error", children: error }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email:" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Contrase\u00F1a:" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true })] }), _jsx("button", { type: "submit", children: "Iniciar Sesi\u00F3n" })] }), _jsxs("p", { children: ["\u00BFNo tienes cuenta? ", _jsx("a", { href: "/register", children: "Reg\u00EDstrate aqu\u00ED" })] })] }) }));
};
export default Login;
