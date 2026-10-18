import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

class ErrorBoundary extends Component {
    state = { hasError: false, error: null };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('App Error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
                    <h2>Something went wrong loading DentOS.</h2>
                    <pre style={{ background: '#f8d7da', color: '#721c24', padding: '16px', borderRadius: '8px', overflow: 'auto' }}>
                        {this.state.error?.toString()}
                    </pre>
                    <button 
                        onClick={() => window.location.reload()} 
                        style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '6px', background: '#1f8da5', color: '#fff', border: 'none', cursor: 'pointer' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ErrorBoundary>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ErrorBoundary>
    </StrictMode>
);
