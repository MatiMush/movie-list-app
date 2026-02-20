import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import '../styles/MovieList.css';
import { useAuth } from '../context/AuthContext';
const MovieList = () => {
    const { user } = useAuth();
    return (_jsxs("div", { className: "movie-list-container", children: [_jsx("h1", { children: "\uD83C\uDFAC Mi Lista de Pel\u00EDculas" }), _jsx("p", { children: "Esta vista qued\u00F3 en modo legado. Usa la pantalla principal para explorar y la secci\u00F3n \"Mi p\u00E1gina\" para gestionar Favoritos, Inter\u00E9s y listas personalizadas." }), !user && _jsx("p", { children: "Inicia sesi\u00F3n para crear y administrar listas." })] }));
};
export default MovieList;
