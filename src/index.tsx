import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const googleClientId =
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    '525681019331-o9slm19otvkehlmo8rnogrl3mm4qfqab.apps.googleusercontent.com';
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>,
);

reportWebVitals();
