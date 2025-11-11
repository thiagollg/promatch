import React from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Video, ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { cn } from '../lib/utils'

const ActivityItem = ({ activity }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle2,
          label: 'Aprobado',
          className: 'bg-green-100 text-green-700 border-green-200'
        }
      case 'pending':
        return {
          icon: Clock,
          label: 'Pendiente',
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
        }
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rechazado',
          className: 'bg-red-100 text-red-700 border-red-200'
        }
      default:
        return {
          icon: Clock,
          label: status,
          className: 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }
  }

  if (activity.type === 'payment') {
    const { sender, receiver, amount, status, isSender, createdAt } = activity.data
    const statusConfig = getStatusConfig(status)
    const StatusIcon = statusConfig.icon

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
        )}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn(
            "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
            isSender ? "bg-red-100" : "bg-green-100"
          )}>
            <DollarSign className={cn(
              "h-6 w-6",
              isSender ? "text-red-600" : "text-green-600"
            )} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-black mb-1">
                  {isSender 
                    ? `Pagaste a ${receiver?.fullName || 'Usuario'}`
                    : `${sender?.fullName || 'Usuario'} te pagó`
                  }
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {formatDate(createdAt)}
                </p>
                
                {/* Amount */}
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-lg font-bold",
                    isSender ? "text-red-600" : "text-green-600"
                  )}>
                    {isSender ? '-' : '+'}{formatAmount(amount)}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
                  statusConfig.className
                )}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig.label}
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">De:</span>
              <span>{sender?.fullName || 'Usuario'}</span>
              <ArrowRight className="h-4 w-4" />
              <span className="font-medium">Para:</span>
              <span>{receiver?.fullName || 'Usuario'}</span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Virtual Class
  const { participants, createdAt } = activity.data

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Video className="h-6 w-6 text-blue-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-black mb-1">
            Clase Virtual
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            {formatDate(createdAt)}
          </p>
          
          {/* Participants */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">Participantes:</p>
            <div className="flex flex-wrap gap-2">
              {participants?.map((participant, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {participant?.fullName || 'Usuario'}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ActivityItem

