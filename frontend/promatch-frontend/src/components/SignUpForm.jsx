import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { signup } from '../lib/api'
import toast from 'react-hot-toast'

const SignUpForm = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  })

  const queryClient = useQueryClient()

  const { mutate: signupMutation, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      toast.success('¡Cuenta creada exitosamente!')
      queryClient.invalidateQueries({
        queryKey: ["authUser"]
      })
    },
    onError: (error) => {
      console.log(error)
    }
  })

  const handleSignup = (e) => {
    e.preventDefault()
    signupMutation(signupData)
  }

  return (
    <form className="space-y-5" onSubmit={handleSignup}>
      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 animate-fade-in">
          <p className="text-sm text-red-600">{error.response?.data?.message || 'Error al crear la cuenta'}</p>
        </div>
      )}

      {/* Full Name */}
      <div className="relative group">
        <label htmlFor="name" className="sr-only">Full Name</label>
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500 group-focus-within:text-black transition-colors duration-200">
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
            <path 
              fill="currentColor" 
              d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
            />
          </svg>
        </span>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Nombre completo"
          value={signupData.fullName}
          onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
          required
          className="block w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 py-3 text-sm text-black placeholder:text-gray-400 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400"
          autoComplete="name"
          disabled={isPending}
        />
      </div>

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
          value={signupData.email}
          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
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
          value={signupData.password}
          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
          required
          className="block w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 py-3 text-sm text-black placeholder:text-gray-400 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400"
          autoComplete="new-password"
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
            Creando cuenta...
          </>
        ) : (
          'Crear cuenta'
        )}
      </button>

      {/* Terms and conditions */}
      <p className="pt-2 text-center text-xs leading-5 text-gray-500">
        Al registrarte aceptas los{' '}
        <a href="#" className="font-semibold text-gray-700 hover:text-black hover:underline transition-colors duration-200">
          Términos de Servicio
        </a>
        {' '}y la{' '}
        <a href="#" className="font-semibold text-gray-700 hover:text-black hover:underline transition-colors duration-200">
          Política de Privacidad
        </a>.
      </p>
    </form>
  )
}

export default SignUpForm

