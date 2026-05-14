import React, { createContext, useContext, useState } from "react";
import { loginRequest, logoutRequest } from "../services/AuthService";

const AuthContext = createContext(null);

const getStoredUsuario = () => {
    const data = sessionStorage.getItem("usuario");

    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch {
        sessionStorage.removeItem("usuario");
        return null;
    }
};

const getRol = (usuario) =>
    usuario?.roL_NOMBRE ??
    usuario?.rOL_NOMBRE ??
    usuario?.ROL_NOMBRE ??
    "";

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(sessionStorage.getItem("token"));
    const [usuario, setUsuario] = useState(getStoredUsuario);

    const login = async (email, password) => {
        const data = await loginRequest({
            USU_EMAIL: email,
            USU_PASSWORD: password,
        });

        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("usuario", JSON.stringify(data.usuario));

        setToken(data.token);
        setUsuario(data.usuario);

        return data;
    };

    const logout = () => {
        logoutRequest();

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("usuario");

        setToken(null);
        setUsuario(null);

        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                usuario,
                rol: getRol(usuario),
                login,
                logout,
                isAuthenticated: Boolean(token),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);