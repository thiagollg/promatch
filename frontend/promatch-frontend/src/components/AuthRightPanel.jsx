import React from 'react'
import { Link } from 'react-router'

const AuthRightPanel = ({ children, title, subtitle, linkText, linkHref }) => {
  return (
    <main className="flex items-center justify-center px-6 sm:px-10 py-10 md:py-0 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <header className="animate-fade-in">
          <h2 className="text-3xl font-bold tracking-tight text-black">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {subtitle}{' '}
            <Link 
              to={linkHref} 
              className="inline-flex items-center font-semibold text-gray-700 hover:text-black transition-colors duration-200"
            >
              {linkText}
              <svg 
                aria-hidden 
                viewBox="0 0 24 24" 
                className="ml-1 h-4 w-4"
              >
                <path 
                  fill="currentColor" 
                  d="M13 5l7 7-7 7v-4H4v-6h9V5z"
                />
              </svg>
            </Link>
          </p>
        </header>

        {/* Form content */}
        <div className="mt-8">
          {children}
        </div>
      </div>
    </main>
  )
}

export default AuthRightPanel

