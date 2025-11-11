import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { login } from '../lib/api'

const LoginForm = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  })

  const queryClient = useQueryClient()

  const { mutate: loginMutation, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] })
    },
    onError: (error) => {
      console.log(error)
    }
  })

  const handleLogin = (e) => {
    e.preventDefault()
    loginMutation(loginData)
  }

  return (
    <form className="space-y-5" onSubmit={handleLogin}>
      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 animate-fade-in">
          <p className="text-sm text-red-600">{error.response?.data?.message || 'Error al iniciar sesión'}</p>
        </div>
      )}

      {/* Email */}
      <div className="relative group">
        <label htmlFor="email" className="sr-only">Email address</label>
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500 group-focus-within:text-black transition-colors duration-200">
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
            <path 
              fill="currentColor" 
              d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"
            />
          </svg>
        </span>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Correo electrónico"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          required
          className="block w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 py-3 text-sm text-black placeholder:text-gray-400 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400"
          autoComplete="email"
          disabled={isPending}
        />
      </div>

      {/* Password */}
      <div className="relative group">
        <label htmlFor="password" className="sr-only">Password</label>
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500 group-focus-within:text-black transition-colors duration-200">
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
            <path 
              fill="currentColor" 
              d="M17 8V7a5 5 0 1 0-10 0v1H5v14h14V8h-2Zm-8 0V7a3 3 0 0 1 6 0v1H9Zm3 5a2 2 0 1 1-2 2 2 2 0 0 1 2-2Z"
            />
          </svg>
        </span>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Contraseña"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          required
          className="block w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 py-3 text-sm text-black placeholder:text-gray-400 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400"
          autoComplete="current-password"
          disabled={isPending}
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <span className="loading loading-spinner loading-sm mr-2"></span>
            Iniciando sesión...
          </>
        ) : (
          'Iniciar sesión'
        )}
      </button>

      {/* Forgot password link */}
      <p className="pt-2 text-center text-xs leading-5 text-gray-500">
        ¿Olvidaste tu contraseña?{' '}
        <a href="#" className="font-semibold text-gray-700 hover:text-black hover:underline transition-colors duration-200">
          Recuperarla aquí
        </a>
      </p>
    </form>
  )
}

export default LoginForm

