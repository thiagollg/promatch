import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import useAuthUser from '../hooks/useAuthUser'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { onboarding, uploadAvatar, connectMercadoPago, getMercadoPagoStatus, getAllSubjects, getAllRoles, getAllLocations, getAllLanguages, deleteMe } from '../lib/api'
import { Button } from './ui/button'
import { cn } from '../lib/utils'
import { MapPin, Languages, BookOpen, DollarSign, User, X, ChevronDown, Upload, CreditCard, CheckCircle2 } from 'lucide-react'

const OnboardingForm = ({ mode = 'onboarding' }) => {
  const { authUser } = useAuthUser()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    avatar: authUser?.avatar || "",
    bio: authUser?.bio || "",
    language: Array.isArray(authUser?.language) ? authUser.language : (authUser?.language ? [authUser.language] : []),
    subject: Array.isArray(authUser?.subject) ? authUser.subject : (authUser?.subject ? [authUser.subject] : []),
    location: authUser?.location?._id || authUser?.location || "",
    price: authUser?.price || 0,
    fullName: authUser?.fullName || "",
    role: authUser?.role?._id || authUser?.role || "",
  })

  // Estados para los selects
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  
  // Estado para preview del avatar (data URL)
  const [avatarPreview, setAvatarPreview] = useState(authUser?.avatar || "")
  const [avatarError, setAvatarError] = useState("")
  
  // Referencia al input file
  const fileInputRef = useRef(null)
  
  // Tamaño máximo del avatar (5MB)
  const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB
  
  // Inicializar avatarPreview cuando authUser cambie o cuando formData.avatar tenga valor pero avatarPreview esté vacío
  useEffect(() => {
    // Si hay avatar en authUser y avatarPreview está vacío, inicializarlo
    if (authUser?.avatar && !avatarPreview) {
      setAvatarPreview(authUser.avatar)
    }
    // Si formData.avatar tiene valor pero avatarPreview está vacío, inicializarlo
    if (formData.avatar && !avatarPreview) {
      setAvatarPreview(formData.avatar)
    }
  }, [authUser?.avatar, formData.avatar])

  const { data: subjects = [] } = useQuery({ queryKey: ["subjects"], queryFn: getAllSubjects })
  const { data: roles = [] } = useQuery({ queryKey: ["roles"], queryFn: getAllRoles })
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: getAllLocations })
  const { data: languages = [] } = useQuery({ queryKey: ["languages"], queryFn: getAllLanguages })

  const { data: mpStatus, refetch: refetchMPStatus } = useQuery({
    queryKey: ["mercadopago-status"],
    queryFn: getMercadoPagoStatus,
    enabled: Boolean(authUser),
  })

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: onboarding,
    onSuccess: () => {
      toast.success(mode === 'onboarding' ? "Onboarding completado" : "Perfil actualizado")
      queryClient.invalidateQueries({ queryKey: ["authUser"] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Error al guardar")
    },
  })

  const { mutate: uploadAvatarMutation, isPending: isUploadingAvatar } = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      console.log('Upload success response:', data)
      // El backend devuelve { success: true, data: { secure_url: "..." } }
      const avatarUrl = data?.data?.secure_url || data?.data?.url || data?.secure_url || data?.url
      
      if (avatarUrl) {
        setFormData((prev) => ({ ...prev, avatar: avatarUrl }))
        setAvatarPreview(avatarUrl)
        setAvatarError("")
        toast.success("Avatar subido exitosamente")
      } else {
        console.error('No avatar URL found in response:', data)
        setAvatarError("Error: No se recibió la URL del avatar")
        toast.error("Error: No se recibió la URL del avatar")
      }
    },
    onError: (error) => {
      console.error('Upload error:', error)
      setAvatarError("Error subiendo avatar. Intenta nuevamente.")
      toast.error(error?.response?.data?.message || error?.message || "Error subiendo avatar")
    },
  })

  const { mutate: connectMpMutation, isPending: isConnectingMp } = useMutation({
    mutationFn: connectMercadoPago,
    onSuccess: (data) => {
      const redirectUrl = data?.url || data?.redirectUrl || data?.init_point || data?.sandbox_init_point || data?.authorization_url
      if (redirectUrl) {
        // Guardar todos los datos del formulario incluyendo avatar preview
        const dataToSave = {
          ...formData,
          avatarPreview: avatarPreview, // Guardar también la preview
        }
        localStorage.setItem('onboardingData', JSON.stringify(dataToSave))
        queryClient.invalidateQueries({ queryKey: ["authUser"] })
        window.location.href = redirectUrl
        return
      }
      toast.error("No se recibió URL de redirección")
    },
    onError: (error) => toast.error(error?.response?.data?.message || error?.message || "Error al conectar Mercado Pago"),
  })

  const { mutate: deleteMeMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteMe,
    onSuccess: () => {
      toast.success("¡Cuenta eliminada exitosamente!")
      queryClient.removeQueries({ queryKey: ["authUser"], exact: false })
      // Esperar un momento para que el usuario vea el toast antes de redirigir
      setTimeout(() => {
        window.location.href = "/login"
      }, 1500)
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Error al eliminar la cuenta"),
  })

  useEffect(() => {
    // Restaurar datos guardados al regresar de MercadoPago
    const saved = localStorage.getItem('onboardingData')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Restaurar todos los datos del formulario
        setFormData({
          avatar: parsed.avatar || authUser?.avatar || "",
          bio: parsed.bio || authUser?.bio || "",
          language: parsed.language || (Array.isArray(authUser?.language) ? authUser.language : (authUser?.language ? [authUser.language] : [])),
          subject: parsed.subject || (Array.isArray(authUser?.subject) ? authUser.subject : (authUser?.subject ? [authUser.subject] : [])),
          location: parsed.location || authUser?.location?._id || authUser?.location || "",
          price: parsed.price || authUser?.price || 0,
          fullName: parsed.fullName || authUser?.fullName || "",
          role: parsed.role || authUser?.role?._id || authUser?.role || "",
        })
        // Restaurar preview del avatar
        if (parsed.avatarPreview) {
          setAvatarPreview(parsed.avatarPreview)
        } else if (parsed.avatar) {
          setAvatarPreview(parsed.avatar)
        }
        localStorage.removeItem('onboardingData')
      } catch (error) {
        console.error('Error restoring saved data:', error)
      }
    }
    
    // Manejar respuesta de MercadoPago
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('mp_connected') === 'true') {
      toast.success('¡Mercado Pago conectado!')
      refetchMPStatus()
    } else if (urlParams.get('mp_error') === 'true') {
      toast.error('Error al conectar con Mercado Pago')
    }
  }, [refetchMPStatus, authUser])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Validar que haya al menos un idioma y una materia
    if (formData.language.length === 0) {
      toast.error("Debes seleccionar al menos un idioma")
      return
    }
    if (formData.subject.length === 0) {
      toast.error("Debes seleccionar al menos una materia")
      return
    }
    
    // Validaciones adicionales para profesores en modo onboarding
    if (mode === 'onboarding' && isProfesor) {
      // Validar que la bio no esté vacía (ReactQuill puede devolver HTML vacío o solo <p><br></p>)
      const bioText = formData.bio?.replace(/<[^>]*>/g, '').trim()
      if (!bioText || bioText === '') {
        toast.error("Debes completar el campo 'Sobre mí' para continuar")
        return
      }
      
      // Validar que MercadoPago esté conectado
      if (!mpStatus?.isConnected) {
        toast.error("Debes conectar tu cuenta de MercadoPago para continuar")
        return
      }
    }
    
    onboardingMutation(formData)
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    
    if (!file) {
      console.log('No file selected')
      return
    }
    
    console.log('File selected:', file.name, file.type, file.size)
    
    // Limpiar error previo
    setAvatarError("")
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setAvatarError("El archivo debe ser una imagen")
      toast.error("El archivo debe ser una imagen")
      e.target.value = "" // Limpiar el input
      return
    }
    
    // Validar tamaño
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError(`El archivo es demasiado grande. Tamaño máximo: ${MAX_AVATAR_SIZE / (1024 * 1024)}MB`)
      toast.error(`El archivo es demasiado grande. Tamaño máximo: ${MAX_AVATAR_SIZE / (1024 * 1024)}MB`)
      e.target.value = "" // Limpiar el input
      return
    }
    
    // Mostrar preview inmediata con data URL
    const reader = new FileReader()
    reader.onloadend = () => {
      try {
        const dataUrl = reader.result
        if (dataUrl) {
          setAvatarPreview(dataUrl)
          // Actualizar formData con la preview temporal mientras se sube
          setFormData((prev) => ({ ...prev, avatar: dataUrl }))
        }
      } catch (error) {
        console.error('Error setting preview:', error)
        setAvatarError("Error al procesar la imagen")
        toast.error("Error al procesar la imagen")
      }
    }
    reader.onerror = () => {
      setAvatarError("Error al leer el archivo")
      toast.error("Error al leer el archivo")
      e.target.value = ""
    }
    reader.readAsDataURL(file)
    
    // Subir al servidor (asíncrono)
    // Asegurar que el file se pasa correctamente
    console.log('Uploading file:', file.name, file.type, file.size)
    uploadAvatarMutation(file)
  }

  const addLanguage = () => {
    if (selectedLanguage && !formData.language.includes(selectedLanguage)) {
      setFormData(prev => ({ ...prev, language: [...prev.language, selectedLanguage] }))
      setSelectedLanguage("")
    }
  }

  const removeLanguage = (langId) => {
    setFormData(prev => ({ ...prev, language: prev.language.filter(id => id !== langId) }))
  }

  const addSubject = () => {
    if (selectedSubject && !formData.subject.includes(selectedSubject)) {
      setFormData(prev => ({ ...prev, subject: [...prev.subject, selectedSubject] }))
      setSelectedSubject("")
    }
  }

  const removeSubject = (subjectId) => {
    setFormData(prev => ({ ...prev, subject: prev.subject.filter(id => id !== subjectId) }))
  }

  const isProfesor = roles?.find((r) => r._id === formData.role)?.name === 'Profesor'

  const getLanguageName = (langId) => {
    return languages.find(l => l._id === langId)?.name || langId
  }

  const getSubjectName = (subjectId) => {
    return subjects.find(s => s._id === subjectId)?.name || subjectId
  }

  // Configuración de React Quill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg bg-gray-100">
          {avatarPreview ? (
            <motion.img
              src={avatarPreview}
              alt="Avatar preview"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <User className="h-12 w-12" />
            </div>
          )}
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="loading loading-spinner loading-md text-white"></span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
            id="avatar-upload"
            ref={fileInputRef}
            disabled={isUploadingAvatar}
            aria-label="Subir imagen de avatar"
          />
          <Button
            type="button"
            variant="outline"
            disabled={isUploadingAvatar}
            className="gap-2"
            onClick={() => {
              console.log('Button clicked, triggering file input')
              fileInputRef.current?.click()
            }}
          >
            {isUploadingAvatar ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Subir avatar
              </>
            )}
          </Button>
          {avatarError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 text-center max-w-xs"
            >
              {avatarError}
            </motion.p>
          )}
        </div>
      </div>

      {/* Nombre Completo (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre completo
        </label>
        <input
          type="text"
          value={formData.fullName || authUser?.fullName || ""}
          readOnly
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 pl-4 pr-4 py-3 text-sm text-gray-600 cursor-not-allowed"
        />
      </div>

      {/* Role Dropdown */}
      <div className="relative group">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rol
        </label>
      <select
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        required
        disabled={mode === 'edit'}
          className={cn(
            "block w-full rounded-lg border border-gray-300 pl-4 pr-10 py-3 text-sm shadow-sm transition-all duration-200 appearance-none",
            mode === 'edit'
              ? "bg-gray-50 text-gray-600 cursor-not-allowed"
              : "bg-white text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 cursor-pointer"
          )}
      >
          <option value="">Selecciona un rol</option>
        {roles.map((role) => (
          <option key={role._id} value={role._id}>{role.name}</option>
        ))}
      </select>
        <ChevronDown className={cn(
          "pointer-events-none absolute right-3 bottom-[2.75rem] h-5 w-5",
          mode === 'edit' ? "text-gray-400" : "text-gray-400"
        )} />
      </div>

      {/* Location Dropdown */}
      <div className="relative group">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ubicación
        </label>
        <span className="pointer-events-none absolute inset-y-0 left-3 top-[2.25rem] flex items-center text-gray-400 group-focus-within:text-black">
          <MapPin className="h-5 w-5" />
        </span>
      <select
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        required
          className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-3 text-sm text-black shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 appearance-none cursor-pointer"
      >
          <option value="">Selecciona una ubicación</option>
        {locations.map((location) => (
          <option key={location._id} value={location._id}>{location.name}</option>
        ))}
      </select>
        <ChevronDown className="pointer-events-none absolute right-3 bottom-[2.75rem] h-5 w-5 text-gray-400" />
      </div>

      {/* Languages Dropdown with Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Idiomas <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 group-focus-within:text-black">
            <Languages className="h-5 w-5" />
          </span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-3 text-sm text-black shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 appearance-none cursor-pointer"
          >
            <option value="">Selecciona un idioma</option>
            {languages
              .filter(lang => !formData.language.includes(lang._id))
              .map((language) => (
                <option key={language._id} value={language._id}>{language.name}</option>
              ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        {selectedLanguage && (
          <Button
            type="button"
            onClick={addLanguage}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Agregar idioma
          </Button>
        )}
        <AnimatePresence>
          {formData.language.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              {formData.language.map((langId) => (
                <motion.div
                  key={langId}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                >
                  <span>{getLanguageName(langId)}</span>
                  <button
                    type="button"
                    onClick={() => removeLanguage(langId)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subjects Dropdown with Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Materias <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 group-focus-within:text-black">
            <BookOpen className="h-5 w-5" />
          </span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-3 text-sm text-black shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 appearance-none cursor-pointer"
          >
            <option value="">Selecciona una materia</option>
            {subjects
              .filter(subj => !formData.subject.includes(subj._id))
              .map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        {selectedSubject && (
          <Button
            type="button"
            onClick={addSubject}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Agregar materia
          </Button>
        )}
        <AnimatePresence>
          {formData.subject.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              {formData.subject.map((subjectId) => (
                <motion.div
                  key={subjectId}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                >
                  <span>{getSubjectName(subjectId)}</span>
                  <button
                    type="button"
                    onClick={() => removeSubject(subjectId)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Campos adicionales para Profesor */}
      <AnimatePresence>
        {isProfesor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 pt-4 border-t border-gray-200"
          >
            {/* Price Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarifa por hora
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <DollarSign className="h-5 w-5" />
                </span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm text-black shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400"
                />
              </div>
            </div>

            {/* Bio Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sobre mí
                {mode === 'onboarding' && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={formData.bio}
                  onChange={(value) => setFormData({ ...formData, bio: value })}
                  modules={quillModules}
                  className="bg-white"
                  style={{ minHeight: '200px' }}
                />
              </div>
              {mode === 'onboarding' && (
                <p className="text-xs text-gray-500 mt-1">Este campo es obligatorio para profesores</p>
              )}
            </div>

            {/* MercadoPago Button */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  MercadoPago
                </label>
                {mode === 'onboarding' && <span className="text-red-500">*</span>}
              </div>
              {mpStatus?.isConnected ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">MercadoPago conectado</p>
                    {mpStatus?.sellerId && (
                      <p className="text-xs text-green-600 mt-1">ID: {mpStatus.sellerId}</p>
                    )}
                  </div>
                  {mode === 'edit' && (
                    <Button
                      type="button"
                      onClick={() => connectMpMutation()}
                      disabled={isConnectingMp}
                      variant="outline"
                      size="sm"
                    >
                      {isConnectingMp ? "Conectando..." : "Reconectar"}
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={() => connectMpMutation()}
                    disabled={isConnectingMp}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    {isConnectingMp ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Conectando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Conectar MercadoPago
                      </>
                    )}
                  </Button>
                  {mode === 'onboarding' && (
                    <p className="text-xs text-gray-500 mt-1">Debes conectar tu cuenta de MercadoPago para continuar</p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 bg-black text-white hover:bg-gray-800"
        >
          {isPending ? (
            <>
              <span className="loading loading-spinner loading-sm mr-2"></span>
              Guardando...
            </>
          ) : (
            mode === 'onboarding' ? "Completar" : "Guardar cambios"
          )}
        </Button>
        </div>

      {/* Delete Account Button (Edit mode only) */}
      {mode === 'edit' && (
        <div className="flex justify-center pt-4">
          <Button
            type="button"
            onClick={() => {
          if (window.confirm('¿Seguro que deseas eliminar tu cuenta? Esta acción es irreversible.')) {
                deleteMeMutation()
              }
            }}
            disabled={isDeleting}
            className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Eliminando...
              </>
            ) : (
              'Eliminar cuenta'
            )}
          </Button>
        </div>
      )}
    </motion.form>
  )
}

export default OnboardingForm
