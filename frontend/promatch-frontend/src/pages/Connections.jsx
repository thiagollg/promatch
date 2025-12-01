import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMyProffessors, getUnreadCounts, getStreamToken } from '../lib/api'
import ConnectionItem from '../components/ConnectionItem'
import ChatView from '../components/ChatView'
import { MessageCircle } from 'lucide-react'
import { StreamChat } from 'stream-chat'
import useAuthUser from '../hooks/useAuthUser'

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

const Connections = () => {
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const { authUser } = useAuthUser()
  const queryClient = useQueryClient()

  const { data: myProffessors = [], isLoading: loadingmyproffessors } = useQuery({
    queryKey: ["myProffessors"],
    queryFn: getMyProffessors
  })

  // Obtener conteos no leídos 
  const { data: unreadData, isLoading: loadingUnread } = useQuery({
    queryKey: ["unreadCounts"],
    queryFn: getUnreadCounts
  })

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser
  })

  const unreadMessages = unreadData?.unreadMessages || {}

  // Conectar Stream Chat y escuchar eventos para actualizar conteos
  useEffect(() => {
    if (!authUser || !tokenData?.token) return

    let client = null
    let handleMessageNew = null
    let handleMessageRead = null
    let handleNotification = null
    let handleUserUpdated = null

    const setupStreamEvents = async () => {
      try {
        client = StreamChat.getInstance(STREAM_API_KEY)

        
        if (!client.userID || client.userID !== authUser._id) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.avatar,
            },
            tokenData.token
          )
        }

        
        handleMessageNew = (event) => {
         
          console.log('📬 New message event received:', event)
          queryClient.invalidateQueries({ queryKey: ['unreadCounts'] })
        }

        handleMessageRead = (event) => {
          
          console.log('👁️ Message read event received:', event)
          queryClient.invalidateQueries({ queryKey: ['unreadCounts'] })
        }

        handleNotification = (event) => {
          
          console.log('🔔 Notification event received:', event)
          queryClient.invalidateQueries({ queryKey: ['unreadCounts'] })
        }

       
        client.on('message.new', handleMessageNew)
        client.on('message.read', handleMessageRead)
        client.on('notification.message_new', handleNotification)
        
        
        handleUserUpdated = () => {
          queryClient.invalidateQueries({ queryKey: ['unreadCounts'] })
        }
        client.on('user.updated', handleUserUpdated)

        console.log('✅ Stream Chat events listener set up')
      } catch (error) {
        console.error('Error setting up Stream Chat events:', error)
      }
    }

    setupStreamEvents()

    // Cleanup al desmontar
    return () => {
      if (client) {
        if (handleMessageNew) client.off('message.new', handleMessageNew)
        if (handleMessageRead) client.off('message.read', handleMessageRead)
        if (handleNotification) client.off('notification.message_new', handleNotification)
        if (handleUserUpdated) client.off('user.updated', handleUserUpdated)
        console.log('🔌 Stream Chat events listener removed')
      }
    }
  }, [authUser, tokenData, queryClient])

  const handleConnectionClick = (professor) => {
    setSelectedConnection(professor)
    setShowChat(true)
  }

  const handleCloseChat = () => {
    setShowChat(false)
    setSelectedConnection(null)
  }


  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50">
      <div className="flex h-full overflow-hidden">
        {/* Sidebar - Conexiones */}
        <aside className={`
          flex flex-col bg-white border-r border-gray-200
          w-full md:w-80 lg:w-96
          ${showChat ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-2xl font-bold text-black mb-1">
              Mis Conexiones
            </h1>
            <p className="text-sm text-gray-600">
              Selecciona una conversación para comenzar
            </p>
          </div>

          {/* Lista de Conexiones */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 activity-scroll">
            {loadingmyproffessors ? (
              <div className='flex justify-center py-12'>
                <span className='loading loading-spinner loading-lg'></span>
              </div>
            ) : myProffessors.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Aún no tienes conexiones</p>
                <p className="text-gray-400 text-sm mt-2">
                  Explora y conecta con profesores desde la página principal
                </p>
              </div>
            ) : (
              myProffessors.map((professor) => (
                <ConnectionItem
                  key={professor._id}
                  professor={professor}
                  hasUnreadMessages={!!unreadMessages[professor._id]}
                  unreadCount={unreadMessages[professor._id]?.count || 0}
                  isSelected={selectedConnection?._id === professor._id}
                  onClick={() => handleConnectionClick(professor)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Área de Chat */}
        <main className={`
          flex-1 flex items-center justify-center
          ${showChat ? 'flex' : 'hidden md:flex'}
          bg-gray-50
        `}>
          {!showChat ? (
            // Estado inicial - No hay chat seleccionado
            <div className="text-center px-6 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <MessageCircle className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-3">
                Selecciona una conversación
              </h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Elige una conexión del panel izquierdo para comenzar a chatear
              </p>
            </div>
          ) : selectedConnection ? (
            // Chat activo
            <div className="w-full h-full">
              <ChatView
                userId={selectedConnection._id}
                onClose={handleCloseChat}
                showCloseButton={true}
              />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default Connections
