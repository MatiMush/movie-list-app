import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import '../styles/Auth.css';
import { useAuth } from '../context/AuthContext';
const Register = ({ onSuccess, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setIsLoading(true);
        try {
            await register(name, email, password);
            onSuccess();
        }
        catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsx("h1", { children: "\uD83C\uDFAC Create Account" }), error && _jsx("p", { className: "error", children: error }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Name:" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), required: true, placeholder: "Your name", minLength: 2, maxLength: 50 })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email:" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, placeholder: "your@email.com" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Password:" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, placeholder: "Min 6 characters", minLength: 6 })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Confirm Password:" }), _jsx("input", { type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true, placeholder: "Repeat your password" })] }), _jsx("button", { type: "submit", disabled: isLoading, children: isLoading ? 'Creating account...' : 'Register' })] }), _jsxs("p", { children: ["Already have an account?", ' ', _jsx("a", { href: "#", onClick: (e) => { e.preventDefault(); onSwitchToLogin(); }, children: "Sign in here" })] })] }) }));
};
export default Register;
