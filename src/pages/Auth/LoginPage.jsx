import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Landmark,
    Lock,
    Mail,
    Eye,
    EyeOff,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import "./Login.css";

export default function LoginPage() {
    const navigate = useNavigate();

    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await login(
                form.email,
                form.password
            );

            const rol =
                response?.usuario?.roL_NOMBRE ??
                response?.usuario?.rOL_NOMBRE ??
                response?.usuario?.ROL_NOMBRE;

            if (rol === "Administrador") {
                navigate("/");
            }
            else if (rol === "Auxiliar") {
                navigate("/");
            }
            else if (rol === "Contador") {
                navigate("/");
            }
            else {
                navigate("/");
            }
        }
        catch (err) {
            setError(
                err?.response?.data?.mensaje ||
                "No se pudo iniciar sesión."
            );
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-header">
                    <div className="login-logo">
                        <Landmark size={34} />
                    </div>

                    <h1>
                        Gestión Cuentas Bancarias
                    </h1>

                    <p>
                        Inicia sesión para continuar
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="login-form"
                >

                    <div className="input-group">
                        <label>
                            Correo electrónico
                        </label>

                        <div className="login-input">
                            <Mail size={18} />

                            <input
                                type="email"
                                name="email"
                                placeholder="usuario@correo.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>
                            Contraseña
                        </label>

                        <div className="login-input">
                            <Lock size={18} />

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword
                                    ? <EyeOff size={18} />
                                    : <Eye size={18} />
                                }
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Ingresando..."
                            : "Iniciar sesión"}
                    </button>

                </form>
            </div>
        </div>
    );
}