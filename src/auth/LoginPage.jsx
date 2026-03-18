import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./msalConfig";

export default function LoginPage() {
  const { instance, inProgress } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  const isLoading = inProgress !== "none";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #082423 0%, #0C4B29 50%, #157340 100%)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 22, padding: "48px 40px",
        boxShadow: "0 26px 64px rgba(0,0,0,0.3)", width: "100%", maxWidth: 420,
        textAlign: "center",
      }}>
        <img src="/logo-synvia.svg" alt="Synvia" style={{ height: 40, marginBottom: 32 }} />

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
          Dashboard de Projetos
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 32, lineHeight: 1.6 }}>
          Acesse com sua conta Microsoft corporativa para visualizar os dados do projeto.
        </p>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: "100%", padding: "14px 24px", borderRadius: 12, border: "none",
            background: isLoading ? "#9ca3af" : "linear-gradient(135deg, #0C4B29, #21A84E)",
            color: "#fff", fontSize: 15, fontWeight: 600, cursor: isLoading ? "wait" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: isLoading ? "none" : "0 12px 32px rgba(33,168,78,0.3)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(33,168,78,0.4)"; } }}
          onMouseLeave={(e) => { if (!isLoading) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(33,168,78,0.3)"; } }}
        >
          <svg width="20" height="20" viewBox="0 0 23 23" fill="none">
            <path d="M11 0H0v11h11V0z" fill="#f25022"/>
            <path d="M23 0H12v11h11V0z" fill="#7fba00"/>
            <path d="M11 12H0v11h11V12z" fill="#00a4ef"/>
            <path d="M23 12H12v11h11V12z" fill="#ffb900"/>
          </svg>
          {isLoading ? "Autenticando..." : "Entrar com Microsoft"}
        </button>

        <p style={{ marginTop: 28, fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
          Acesso restrito a colaboradores Synvia.<br />
          Use sua conta <strong>@synvia.com</strong> para continuar.
        </p>
      </div>
    </div>
  );
}
