import React from 'react'
import AuthLeftPanel from '../components/AuthLeftPanel'
import AuthRightPanel from '../components/AuthRightPanel'
import LoginForm from '../components/LoginForm'

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full bg-white text-black">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        {/* Left panel */}
        <AuthLeftPanel />
        
        {/* Right panel */}
        <AuthRightPanel
          title="Inicia sesión en tu cuenta"
          subtitle="¿No tienes una cuenta?"
          linkText="Regístrate"
          linkHref="/signup"
        >
          <LoginForm />
        </AuthRightPanel>
      </div>
    </div>
  )
}

export default LoginPage
