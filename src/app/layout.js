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
      import('bootstrap/dist/js/bootstrap.bundle.min.js');
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
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0"> {/* Use me-auto to push login/logout to right */}
                {currentUserRole === 'reception' && (
                  <li className="nav-item">
                    <Link className="nav-link" href="/reception">Reception</Link>
                  </li>
                )}
                {currentUserRole === 'doctor' && (
                  <li className="nav-item">
                    <Link className="nav-link" href="/doctor">Doctor</Link>
                  </li>
                )}
                {currentUserRole === 'owner' && (
                  <li className="nav-item">
                    <Link className="nav-link" href="/owner">Owner</Link>
                  </li>
                )}
              </ul>
              <ul className="navbar-nav">
                {currentUserRole ? (
                  <li className="nav-item">
                    <button className="btn btn-outline-danger d-block d-lg-inline-block w-100 w-lg-auto mt-2 mt-lg-0" onClick={handleLogout}>Logout</button>
                  </li>
                ) : (
                  <li className="nav-item">
                    <Link className="nav-link" href="/login">Login</Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
