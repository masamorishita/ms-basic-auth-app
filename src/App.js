import React, { useState, useEffect } from 'react';
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import './App.css';

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: 'your-actual-azure-client-id', // Your actual Azure client ID
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'http://localhost:3000',
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
};

// MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
        
        // Handle redirect promise
        await msalInstance.handleRedirectPromise();
        
        // Check if user is already signed in
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          setUser(accounts[0]);
        }
        
        setInitialized(true);
      } catch (err) {
        setError(err.message);
        console.error('MSAL Initialization Error:', err);
      }
    };

    initializeMsal();
  }, []);

  const loginRequest = {
    scopes: ['openid', 'profile', 'email', 'User.Read']
  };

  const handleLogin = async () => {
    if (!initialized) {
      setError('MSAL is not initialized yet. Please wait...');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await msalInstance.loginPopup(loginRequest);
      
      if (response) {
        setUser(response.account);
        console.log('Login successful:', response.account);
      }
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError) {
        try {
          await msalInstance.acquireTokenPopup(loginRequest);
        } catch (tokenError) {
          setError(tokenError.message);
          console.error('Token acquisition error:', tokenError);
        }
      } else {
        setError(err.message);
        console.error('Login error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await msalInstance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      });
      setUser(null);
    } catch (err) {
      setError(err.message);
      console.error('Logout error:', err);
    }
  };

  if (!initialized) {
    return <div className="App">Initializing authentication...</div>;
  }

  return (
    <div className="App">
      <div className="auth-container">
        {!user ? (
          <button 
            onClick={handleLogin} 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Sign in with Microsoft'}
          </button>
        ) : (
          <div className="user-info">
            <p>Welcome, {user.name || user.username}</p>
            <p>Email: {user.username}</p>
            <button 
              onClick={handleLogout}
              className="logout-button"
            >
              Sign Out
            </button>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="clear-error-button"
            >
              Clear Error
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 