"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err) {
      console.error(err);
      setError("Invalid email or password. Are you Sahityaka?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="gemini-bg-glow"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="base-panel"
        style={{ 
          padding: '40px', 
          borderRadius: '32px', 
          width: '90%', 
          maxWidth: '400px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Sparkles size={48} color="url(#gemini-grad)" />
          </div>
          <h1 className="gemini-gradient-text" style={{ fontSize: '2rem', marginBottom: '8px' }}>S</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Welcome back, Sahityaka.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px',
                background: 'var(--btn-bg)', border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', transition: 'border 0.3s'
              }}
              onFocus={(e) => e.target.style.border = '1px solid var(--accent-color)'}
              onBlur={(e) => e.target.style.border = '1px solid var(--glass-border)'}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '16px 48px 16px 48px', borderRadius: '16px',
                background: 'var(--btn-bg)', border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', transition: 'border 0.3s'
              }}
              onFocus={(e) => e.target.style.border = '1px solid var(--accent-color)'}
              onBlur={(e) => e.target.style.border = '1px solid var(--glass-border)'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p style={{ color: '#ff4b4b', fontSize: '0.85rem', margin: 0, textAlign: 'center' }}>{error}</p>}

          <button 
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '8px', padding: '16px', borderRadius: '16px',
              background: 'linear-gradient(74deg, #4285F4 0%, #9B72CB 46%, #D96570 100%)',
              color: 'white', border: 'none', fontSize: '1rem', fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(155, 114, 203, 0.4)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isLoading ? 'Verifying...' : 'Enter'} <ArrowRight size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
