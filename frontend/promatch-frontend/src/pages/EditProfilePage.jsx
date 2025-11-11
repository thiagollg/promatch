import React from 'react'
import OnboardingForm from '../components/OnboardingForm'

const EditProfilePage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
            Editar perfil
          </h1>
          <p className="text-gray-600">
            Actualiza tu información personal y configuración
          </p>
        </div>
        <OnboardingForm mode="edit" />
      </div>
    </div>
  )
}

export default EditProfilePage
