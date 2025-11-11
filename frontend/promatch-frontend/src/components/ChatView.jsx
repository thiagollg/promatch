import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import useAuthUser from '../hooks/useAuthUser'
import { useQuery, useMutation } from "@tanstack/react-query"
import { getStreamToken, createVirtualClass } from '../lib/api'
import toast from "react-hot-toast"
import { StreamChat } from "stream-chat"
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react"
import { Video, X, User } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

const ChatView = ({ userId, onClose, showCloseButton = false }) => {
  const [chatClient, setChatClient] = useState(null)
  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef(null)
  const navigate = useNavigate()
  
  const { authUser } = useAuthUser()
  const isCurrentUserProfessor = authUser?.role?.name === "Profesor"
  const isCurrentUserAlumno = authUser?.role?.name === "Alumno"

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser
  })

  const { mutate: createVirtualClassMutation } = useMutation({
    mutationFn: ({ participants, channelId }) => createVirtualClass(participants, channelId),
    onSuccess: () => {
      console.log("📹 Virtual class registered successfully")
    },
    onError: (error) => {
      console.error("❌ Error creating virtual class:", error)
    }
  })

  useEffect(() => {
    let isMounted = true
    let client = null
    
    const initChat = async () => {
      if (!tokenData?.token || !authUser || !userId) {
        if (isMounted) {
          setLoading(false)
        }
        return
      }

      // Reset state when userId changes
      if (isMounted) {
        setLoading(true)
        setChatClient(null)
        setChannel(null)
      }

      // Stop watching previous channel if it exists
      const previousChannel = channelRef.current
      if (previousChannel) {
        try {
          await previousChannel.stopWatching()
        } catch (err) {
          console.warn("Error stopping previous channel:", err)
        }
        channelRef.current = null
      }

      try {
        // Get or create client instance
        client = StreamChat.getInstance(STREAM_API_KEY)

        // Check if user is already connected
        if (!client.userID || client.userID !== authUser._id) {
          await client.connectUser({
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.avatar,
          }, tokenData.token)
        }

        const channelId = [authUser._id, userId].sort().join("-")
        
        // Create and watch new channel
        const currentChannel = client.channel("messaging", channelId, {
          members: [authUser._id, userId],
        })

        await currentChannel.watch()

        // Only update state if component is still mounted
        if (isMounted) {
          channelRef.current = currentChannel
          setChatClient(client)
          setChannel(currentChannel)
          setLoading(false)
        }
      } catch (error) {
        console.error("error", error)
        if (isMounted) {
          toast.error("Error al cargar el chat")
          setLoading(false)
        }
      }
    }
    
    initChat()

    // Cleanup function
    return () => {
      isMounted = false
      
      // Stop watching the current channel
      const channelToStop = channelRef.current
      if (channelToStop) {
        channelToStop.stopWatching().catch((err) => {
          console.warn("Error stopping channel on cleanup:", err)
        })
        channelRef.current = null
      }
      
      // Note: We don't disconnect the user here because:
      // 1. getInstance() returns a singleton that might be used elsewhere
      // 2. Disconnecting would affect other components using the same instance
      // 3. The user should remain connected while on the connections page
    }
  }, [tokenData, authUser, userId])

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`
      const channelId = channel.id
      
      
      
      const participants = [authUser._id, userId]
      console.log("channelId", channelId)
      console.log("participants", participants)
      channel.sendMessage({
        text: `join me ${callUrl}`,
      })
      createVirtualClassMutation({ participants, channelId })
      toast.success("Videollamada iniciada")
    }
  }

  const handleViewProfile = () => {
    navigate(`/professor/${userId}`)
  }

  if (loading || !chatClient || !channel) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg mb-4"></span>
          <p className="text-gray-600">Cargando chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Stream Chat */}
      <div className="flex-1 min-h-0 flex flex-col">
        <Chat client={chatClient}>
          <Channel channel={channel}>
            <Window>
              <div className="h-full flex flex-col">
                {/* Header personalizado */}
                <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {showCloseButton && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onClose}
                          className="md:hidden -ml-2 flex-shrink-0"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                      <div className="min-w-0 flex-1">
                        <ChannelHeader />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isCurrentUserAlumno && (
                        <Button
                          onClick={handleViewProfile}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                        >
                          <User className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Ver perfil</span>
                          <span className="sm:hidden">Perfil</span>
                        </Button>
                      )}
                      {isCurrentUserProfessor && (
                        <Button
                          onClick={handleVideoCall}
                          className="bg-black text-white hover:bg-gray-800 whitespace-nowrap"
                          size="sm"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Iniciar videollamada</span>
                          <span className="sm:hidden">Video</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                {/* Mensajes */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <MessageList />
                </div>
                {/* Input */}
                <div className="flex-shrink-0">
                  <MessageInput focus />
                </div>
              </div>
            </Window>
          </Channel>
        </Chat>
      </div>
    </div>
  )
}

export default ChatView

