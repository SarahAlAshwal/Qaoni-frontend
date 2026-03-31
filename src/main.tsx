import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from "react-redux";
import { store } from './store/index.ts';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { ImageKitProvider } from './providers/ImageKitProvider.tsx';

const domain = import.meta.env.VITE_AUTH_DOMAIN;
const clientId = import.meta.env.VITE_AUTH_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin, // after login, return here
        audience,
      }}
    >
      <Provider store={store}>
        <BrowserRouter>
          <ImageKitProvider>
            <App />
          </ImageKitProvider>
        </BrowserRouter>
      </Provider>
    </Auth0Provider>
  </StrictMode>,
)
