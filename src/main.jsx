import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MsalProvider, MsalAuthenticationTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import { PublicClientApplication, InteractionType } from '@azure/msal-browser'
import './index.css'
import App from './App.jsx'

const msalConfig = {
  auth: {
    clientId: "d2b2bceb-ce29-4cac-a86a-9ee968ff255f",
    authority: "https://login.microsoftonline.com/fee1b506-24b6-444a-919e-83df9442dc5d",
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
  },
};

const pca = new PublicClientApplication(msalConfig);

pca.initialize().then(() => {
  return pca.handleRedirectPromise();
}).then((resp) => {
  if (resp?.account) {
    pca.setActiveAccount(resp.account);
  } else {
    const accs = pca.getAllAccounts();
    if (accs.length > 0) pca.setActiveAccount(accs[0]);
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <MsalProvider instance={pca}>
        <App />
      </MsalProvider>
    </StrictMode>,
  )
}).catch((err) => {
  console.error("Erro MSAL:", err);
  // Limpar estado corrompido e renderizar mesmo assim
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith("msal.")) localStorage.removeItem(k);
  });
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <MsalProvider instance={pca}>
        <App />
      </MsalProvider>
    </StrictMode>,
  )
})
