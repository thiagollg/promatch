import React, { useState } from 'react'
import useAuthUser from "../hooks/useAuthUser"
import { useLocation } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { logout } from '../lib/api'
import { GraduationCap } from 'lucide-react'
import { BellIcon } from 'lucide-react'
import { LogOutIcon } from 'lucide-react'
import { Menu, X, User as UserIcon } from 'lucide-react'
import { Link } from 'react-router'

const Navbar = () => {
  const { authUser } = useAuthUser()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const isCallPage = location.pathname?.startsWith("/call")

  const queryClient = useQueryClient()

  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] })
  })

  // Don't show navbar on call page
  if (isCallPage) return null

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <GraduationCap className="h-8 w-8 text-black" />
              <span className="text-xl font-bold text-black hidden sm:block">ProMatch</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/connections" 
                className="text-gray-700 hover:text-black transition-colors font-medium"
              >
                Chats
              </Link>
              <Link 
                to="/activity" 
                className="text-gray-700 hover:text-black transition-colors font-medium"
              >
                Actividad
              </Link>
            </div>
          </div>

          {/* Right side - desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/activity">
              <button className="relative p-2 text-gray-700 hover:text-black transition-colors rounded-lg hover:bg-gray-100">
                <BellIcon className="h-5 w-5" />
              </button>
            </Link>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img 
                  src={authUser?.avatar} 
                  alt={authUser?.fullName} 
                  className="w-8 h-8 rounded-full"
                />
              </button>

              {/* Dropdown menu */}
              {isProfileMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-200">
                      <p className="font-semibold text-sm text-black truncate">{authUser?.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{authUser?.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <UserIcon className="h-4 w-4" />
                        Ver perfil
                      </Link>
                      <button
                        onClick={() => {
                          logoutMutation()
                          setIsProfileMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOutIcon className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <div className="pt-4 space-y-2">
              <Link
                to="/connections"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Chats
              </Link>
              <Link
                to="/activity"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Actividad
              </Link>
              
              {/* Mobile profile section */}
              <div className="pt-4 border-t border-gray-200">
                <div className="px-4 py-2">
                  <p className="font-semibold text-sm text-black">{authUser?.fullName}</p>
                  <p className="text-xs text-gray-500">{authUser?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <UserIcon className="h-4 w-4" />
                  Ver perfil
                </Link>
                <button
                  onClick={() => {
                    logoutMutation()
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOutIcon className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
