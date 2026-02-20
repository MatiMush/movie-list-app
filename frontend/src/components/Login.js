import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import '../styles/Auth.css';
import { useAuth } from '../context/AuthContext';
const Login = ({ onSuccess, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            onSuccess();
        }
        catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsx("h1", { children: "\uD83C\uDFAC Sign In" }), error && _jsx("p", { className: "error", children: error }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email:" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, placeholder: "your@email.com" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Password:" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, placeholder: "Your password" })] }), _jsx("button", { type: "submit", disabled: isLoading, children: isLoading ? 'Signing in...' : 'Sign In' })] }), _jsxs("p", { children: ["Don't have an account?", ' ', _jsx("a", { href: "#", onClick: (e) => { e.preventDefault(); onSwitchToRegister(); }, children: "Register here" })] })] }) }));
};
export default Login;
