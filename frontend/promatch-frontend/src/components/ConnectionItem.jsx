import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { cn } from '../lib/utils'

const ConnectionItem = ({ professor, hasUnreadMessages, unreadCount, isSelected, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200",
        isSelected 
          ? "bg-black text-white" 
          : "bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img 
            src={professor.avatar} 
            alt={professor.fullName} 
            className="w-full h-full object-cover"
          />
        </div>
        {/* Indicador de mensajes no leídos */}
        {hasUnreadMessages && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-semibold truncate",
          isSelected ? "text-white" : "text-black"
        )}>
          {professor.fullName}
        </h3>
        {hasUnreadMessages && unreadCount > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <MessageCircle className={cn(
              "h-3.5 w-3.5",
              isSelected ? "text-white/80" : "text-red-500"
            )} />
            <p className={cn(
              "text-xs truncate",
              isSelected ? "text-white/80" : "text-gray-600"
            )}>
              {unreadCount} {unreadCount === 1 ? 'mensaje sin leer' : 'mensajes sin leer'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ConnectionItem

