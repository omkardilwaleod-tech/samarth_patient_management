"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link'; // Import Link

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Removed metadata export as layout is now a client component

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check authentication on route change or initial load
    const role = localStorage.getItem('userRole');
    setCurrentUserRole(role);

    const publicPaths = ['/', '/login']; // Paths accessible to everyone
    const protectedPaths = {
      '/reception': 'reception',
      '/doctor': 'doctor',
      '/owner': 'owner',
    };

    if (!publicPaths.includes(pathname)) {
      // If trying to access a protected path
      if (!role) {
        // No role found, redirect to login
        router.push('/login');
      } else if (protectedPaths[pathname] && protectedPaths[pathname] !== role) {
        // Role exists but doesn't match the required role for the path
        router.push('/login'); // Or redirect to a 403 page/their allowed page
      }
    }
  }, [pathname, router]); // Re-run effect when pathname or router changes

  useEffect(() => {
    // Load Bootstrap JS only on client side
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
      script.integrity = 'sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
      
      return () => {
        // Cleanup: remove script when component unmounts
        const existingScript = document.querySelector(`script[src="${script.src}"]`);
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    setCurrentUserRole(null);
    router.push('/login');
  };

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={geistSans.variable}>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <Link className="navbar-brand" href="/">Patient Management App</Link>
            <button 
              className="navbar-toggler d-lg-none" 
              type="button" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            
            {/* Desktop Navigation */}
            <div className="d-none d-lg-flex navbar-nav ms-auto">
              {currentUserRole === 'reception' && (
                <Link className="nav-link" href="/reception">Reception</Link>
              )}
              {currentUserRole === 'doctor' && (
                <Link className="nav-link" href="/doctor">Doctor</Link>
              )}
              {currentUserRole === 'owner' && (
                <Link className="nav-link" href="/owner">Owner</Link>
              )}
              {currentUserRole ? (
                <button className="btn btn-outline-danger ms-2" onClick={handleLogout}>Logout</button>
              ) : (
                <Link className="nav-link" href="/login">Login</Link>
              )}
            </div>
            
            {/* Mobile Navigation */}
            <div className={`d-lg-none ${mobileMenuOpen ? 'd-block' : 'd-none'} position-absolute top-100 start-0 w-100 bg-light border-top`} style={{zIndex: 1000}}>
              <div className="container-fluid py-2">
                {currentUserRole === 'reception' && (
                  <Link className="nav-link d-block py-2" href="/reception" onClick={() => setMobileMenuOpen(false)}>Reception</Link>
                )}
                {currentUserRole === 'doctor' && (
                  <Link className="nav-link d-block py-2" href="/doctor" onClick={() => setMobileMenuOpen(false)}>Doctor</Link>
                )}
                {currentUserRole === 'owner' && (
                  <Link className="nav-link d-block py-2" href="/owner" onClick={() => setMobileMenuOpen(false)}>Owner</Link>
                )}
                {currentUserRole ? (
                  <button className="btn btn-outline-danger w-100 mt-2" onClick={() => {handleLogout(); setMobileMenuOpen(false);}}>Logout</button>
                ) : (
                  <Link className="nav-link d-block py-2" href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                )}
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
