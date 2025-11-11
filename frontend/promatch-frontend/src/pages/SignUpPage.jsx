import React from 'react'
import AuthLeftPanel from '../components/AuthLeftPanel'
import AuthRightPanel from '../components/AuthRightPanel'
import SignUpForm from '../components/SignUpForm'

const SignUpPage = () => {
  return (
    <div className="min-h-screen w-full bg-white text-black">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        {/* Left panel */}
        <AuthLeftPanel />
        
        {/* Right panel */}
        <AuthRightPanel
          title="Crea tu cuenta"
          subtitle="¿Ya tienes una cuenta?"
          linkText="Inicia sesión"
          linkHref="/login"
        >
          <SignUpForm />
        </AuthRightPanel>
      </div>
    </div>
  )
}

export default SignUpPage
