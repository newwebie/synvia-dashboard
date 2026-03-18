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
      background: "linear-gradient(160deg, #051e1d 0%, #082423 30%, #0C4B29 70%, #157340 100%)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* Padrão decorativo de fundo */}
      <div style={{
        position: "absolute", top: -120, right: -120,
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(33,168,78,0.12) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", bottom: -80, left: -80,
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(33,168,78,0.08) 0%, transparent 70%)",
      }} />

      <div style={{
        background: "#fff", borderRadius: 24, width: "100%", maxWidth: 440,
        boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05)",
        position: "relative", zIndex: 1, overflow: "hidden",
      }}>
        {/* Barra verde decorativa no topo */}
        <div style={{
          height: 4,
          background: "linear-gradient(90deg, #0C4B29, #21A84E, #4ade80)",
        }} />

        <div style={{ padding: "44px 44px 40px", textAlign: "center" }}>
          {/* Logo */}
          <img
            src="/logo-synvia-preto.png"
            alt="Synvia"
            style={{
              height: 72, display: "block", marginLeft: "auto", marginRight: "auto",
              marginBottom: 12,
            }}
          />

          {/* Separador sutil */}
          <div style={{
            width: 48, height: 3, borderRadius: 2, margin: "0 auto 28px",
            background: "linear-gradient(90deg, #0C4B29, #21A84E)",
          }} />

          <h1 style={{
            fontSize: 24, fontWeight: 700, color: "#111827",
            marginBottom: 8, letterSpacing: "-0.02em",
          }}>
            Dashboard de Projetos
          </h1>
          <p style={{
            fontSize: 14, color: "#6b7280", marginBottom: 36,
            lineHeight: 1.7, maxWidth: 300, marginLeft: "auto", marginRight: "auto",
          }}>
            Acesse com sua conta Microsoft corporativa para visualizar os dados do projeto.
          </p>

          {/* Botão de login */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            style={{
              width: "100%", padding: "15px 24px", borderRadius: 14, border: "none",
              background: isLoading ? "#9ca3af" : "linear-gradient(135deg, #0C4B29, #21A84E)",
              color: "#fff", fontSize: 15, fontWeight: 600,
              cursor: isLoading ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              boxShadow: isLoading ? "none" : "0 8px 28px rgba(12,75,41,0.35)",
              transition: "transform 0.2s, box-shadow 0.2s",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(12,75,41,0.45)"; } }}
            onMouseLeave={(e) => { if (!isLoading) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(12,75,41,0.35)"; } }}
          >
            <svg width="20" height="20" viewBox="0 0 23 23" fill="none">
              <path d="M11 0H0v11h11V0z" fill="#f25022"/>
              <path d="M23 0H12v11h11V0z" fill="#7fba00"/>
              <path d="M11 12H0v11h11V12z" fill="#00a4ef"/>
              <path d="M23 12H12v11h11V12z" fill="#ffb900"/>
            </svg>
            {isLoading ? "Autenticando..." : "Entrar com Microsoft"}
          </button>

          {/* Rodapé */}
          <div style={{
            marginTop: 32, paddingTop: 24,
            borderTop: "1px solid #f3f4f6",
          }}>
            <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6 }}>
              Acesso restrito a colaboradores Synvia.<br />
              Use sua conta <strong style={{ color: "#6b7280" }}>@synvia.com</strong> para continuar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
