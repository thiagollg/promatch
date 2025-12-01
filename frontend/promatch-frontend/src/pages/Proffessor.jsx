import React from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { MapPin, DollarSign, Users, MessageCircle, CreditCard } from 'lucide-react'
import { getProfessorById, createConnection, checkConnectionStatus, createPayment } from '../lib/api'
import toast from 'react-hot-toast'
import useAuthUser from '../hooks/useAuthUser'
import ProffessorCard from '../components/ProffessorCard'
import { Button } from '../components/ui/button'
import { cn } from '../lib/utils'

const Proffessor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {authUser} = useAuthUser();
  
  
  const isCurrentUserProfessor = authUser?.role?.name === "Profesor";
  
  // información del profesor
  const {data: professor, isLoading: loadingProfessor} = useQuery({
    queryKey: ["professor", id],
    queryFn: () => getProfessorById(id),
    enabled: !!id
  })

  
  const {data: connectionStatus, isLoading: loadingConnectionStatus} = useQuery({
    queryKey: ["connectionStatus", id],
    queryFn: () => checkConnectionStatus(id),
    enabled: !!id
  })

  


  const {mutate: connectMutation, isPending: isConnecting} = useMutation({
    mutationFn: createConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", id] });
      queryClient.invalidateQueries({ queryKey: ["myProffessors"] });
      toast.success("¡Conectado exitosamente!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al conectar");
    }
  })

 
  const {mutate: paymentMutation, isPending: isCreatingPayment} = useMutation({
    mutationFn: createPayment,
    onSuccess: (data) => {
      const paymentUrl = data.initPoint;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.error("No se pudo obtener la URL de pago");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al crear el pago");
    }
  })

  const handleConnect = () => {
    if (id) {
      connectMutation(id);
    }
  }

  const handlePay = () => {
    if (id) {
      paymentMutation(id);
    }
  }

  const handleViewConversation = () => {
    navigate('/connections')
  }

  
  const connectionCount = professor?.connection?.length || 0;
  const isConnected = connectionStatus?.isConnected || false;

  
  const formatLanguages = (languages) => {
    if (!languages || languages.length === 0) return []
    if (Array.isArray(languages)) {
      return languages.map(lang => {
        if (typeof lang === 'object' && lang?.name) return lang.name
        if (typeof lang === 'string') return lang
        return String(lang)
      }).filter(Boolean)
    }
    if (typeof languages === 'object' && languages.name) return [languages.name]
    return []
  }

  const formatLocation = (location) => {
    if (!location) return 'No especificado'
    if (typeof location === 'object' && location?.name) return location.name
    if (typeof location === 'string') return location
    return String(location)
  }

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Gratis'
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  const languages = professor ? formatLanguages(professor.language) : []

  if (loadingProfessor) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg mb-4"></span>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!professor) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Profesor no encontrado</h2>
          <button 
            onClick={() => navigate('/')} 
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Subjects como Tags - Centradas arriba siempre */}
        {professor.subject && professor.subject.length > 0 && (
          <div className="mb-12 flex flex-wrap gap-3 justify-center">
            {professor.subject.map((subject, index) => (
              <button
                key={subject._id || index}
                className="px-4 py-2 rounded-full font-medium text-sm transition-all bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                {subject.name || subject}
              </button>
            ))}
          </div>
        )}

        {/* Main Profile Section - Grid de 3 columnas para desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {/* Panel izquierdo - Card oscuro con avatar (solo desktop) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
                <img
                  src={professor.avatar || 'https://via.placeholder.com/150'}
                  alt={professor.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>

          {/* Panel derecho - Perfil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
           

           

            {/* Header with Name and Location - Con border-b */}
            <div className="border-b border-gray-200 pb-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-black mb-4 tracking-tight lowercase">
                {professor.fullName}
              </h1>
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-black" />
                <span className="text-xl md:text-2xl font-semibold text-black">
                  {formatLocation(professor.location)}
                </span>
              </div>
            </div>

            {/* Panel de Acciones - Solo desktop */}
            <div className="hidden lg:block space-y-6">
                {/* Tarifa e Idiomas - Grid de 2 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Tarifa */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="w-6 h-6 text-black" />
                      <h2 className="text-lg font-bold text-black">Tarifa por hora</h2>
                    </div>
                    <p className="text-3xl font-black text-black">
                      {formatPrice(professor.price)}
                    </p>
                  </div>

                  {/* Idiomas */}
                  {languages.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-black mb-4">Idiomas</h2>
                      <div className="flex flex-wrap gap-3">
                        {languages.map((lang, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-medium text-sm"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones y Alumnos - Misma fila */}
                <div className={cn("flex gap-2 items-stretch h-20", isCurrentUserProfessor && "opacity-50")}>
                  {/* Botón Conectar / Ver Conversación */}
                  {loadingConnectionStatus ? (
                    <Button
                      disabled
                      className="flex-[0.4] bg-gray-300 text-gray-600 cursor-not-allowed h-full flex items-center justify-center"
                    >
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Cargando...
                    </Button>
                  ) : isConnected ? (
                    <Button
                      onClick={handleViewConversation}
                      disabled={isCurrentUserProfessor}
                      className={cn(
                        "flex-[0.4] bg-black text-white hover:bg-gray-800 h-full flex items-center justify-center",
                        isCurrentUserProfessor && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Conversación
                    </Button>
                  ) : (
                    <Button
                      onClick={handleConnect}
                      disabled={isConnecting || isCurrentUserProfessor}
                      className={cn(
                        "flex-[0.4] bg-black text-white hover:bg-gray-800 h-full flex items-center justify-center",
                        isCurrentUserProfessor && "cursor-not-allowed opacity-50"
                      )}
                    >
                      {isConnecting ? (
                        <>
                          <span className="loading loading-spinner loading-sm mr-2"></span>
                          Conectando...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Conectar
                        </>
                      )}
                    </Button>
                  )}

                  {/* Botón Pagar */}
                  <Button
                    onClick={handlePay}
                    disabled={!isConnected || isCreatingPayment || isCurrentUserProfessor}
                    className={cn(
                      "flex-[0.4] h-full flex items-center justify-center",
                      isConnected
                        ? "bg-gray-800 text-white hover:bg-gray-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed",
                      isCurrentUserProfessor && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {isCreatingPayment ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pagar
                      </>
                    )}
                  </Button>

                  {/* Alumnos */}
                  <div className="flex-[0.2] bg-gray-100 rounded-lg flex flex-col items-center justify-center h-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-5 h-5 text-black" />
                      <p className="text-sm font-bold text-black">Alumnos</p>
                    </div>
                    <p className="text-2xl font-black text-black">{connectionCount || 0}</p>
                  </div>
                </div>

                {!isConnected && !isCurrentUserProfessor && (
                  <p className="text-xs text-gray-500 text-center">
                    Conecta primero para poder pagar
                  </p>
                )}
              </div>

            {/* Precio e Idiomas - Solo tablet/mobile, en grid */}
            <div className="lg:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  {/* Precio */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="w-6 h-6 text-black" />
                      <h2 className="text-lg font-bold text-black">Tarifa por hora</h2>
                    </div>
                    <p className="text-3xl font-black text-black">
                      {formatPrice(professor.price)}
                    </p>
                  </div>

                  {/* Idiomas */}
                  {languages.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-black mb-4">Idiomas</h2>
                      <div className="flex flex-wrap gap-3">
                        {languages.map((lang, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-medium text-sm"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
          </motion.div>
        </div>

        {/* Sección "Sobre mí" - Fuera del grid, con border-t */}
        {professor.bio && (
          <div className="w-full border-t border-gray-200 pt-8">
            <h2 className="text-lg font-bold text-black mb-4">Sobre mi</h2>
            <div
              className="rich-text-content"
              dangerouslySetInnerHTML={{ __html: professor.bio }}
            />
          </div>
        )}

        {/* Panel de acciones fijo para tablet/mobile - Se renderiza fuera del panel principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cn(
            "bg-white border-t border-gray-200 shadow-lg",
            "fixed bottom-0 left-0 right-0 z-50",
            "lg:hidden",
            "p-4",
            isCurrentUserProfessor && "opacity-50"
          )}
        >
            {/* Contenido móvil compacto */}
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between gap-4 mb-3">
                {/* Precio y conexiones en una fila */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-black" />
                    <span className="text-sm font-bold text-black">
                      {formatPrice(professor.price)}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-black" />
                    <span className="text-sm font-bold text-black">
                      {connectionCount || 0} {connectionCount === 1 ? 'alumno' : 'alumnos'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones en una fila */}
              <div className="flex gap-2">
                {loadingConnectionStatus ? (
                  <Button
                    disabled
                    className="flex-1 bg-gray-300 text-gray-600 cursor-not-allowed text-xs py-2 h-auto"
                  >
                    <span className="loading loading-spinner loading-xs mr-1"></span>
                    Cargando...
                  </Button>
                ) : isConnected ? (
                  <Button
                    onClick={handleViewConversation}
                    disabled={isCurrentUserProfessor}
                    className={cn(
                      "flex-1 bg-black text-white hover:bg-gray-800 text-xs py-2 h-auto",
                      isCurrentUserProfessor && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Conversación
                  </Button>
                ) : (
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting || isCurrentUserProfessor}
                    className={cn(
                      "flex-1 bg-black text-white hover:bg-gray-800 text-xs py-2 h-auto",
                      isCurrentUserProfessor && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {isConnecting ? (
                      <>
                        <span className="loading loading-spinner loading-xs mr-1"></span>
                        Conectando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Conectar
                      </>
                    )}
                  </Button>
                )}

                <Button
                  onClick={handlePay}
                  disabled={!isConnected || isCreatingPayment || isCurrentUserProfessor}
                  className={cn(
                    "flex-1 text-xs py-2 h-auto",
                    isConnected
                      ? "bg-gray-800 text-white hover:bg-gray-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed",
                    isCurrentUserProfessor && "cursor-not-allowed opacity-50"
                  )}
                >
                  {isCreatingPayment ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-1"></span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-3 w-3 mr-1" />
                      Pagar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

        
      </div>

      {/* Espaciado inferior en móvil/tablet para el panel fijo */}
      <div className="h-32 lg:h-0"></div>
    </div>
  )
}

export default Proffessor