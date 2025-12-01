import React, { useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import { MapPin, DollarSign, BookOpen } from 'lucide-react'
import { cn } from '../lib/utils'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

const ProffessorCard = ({ proffessor }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [5, -5]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  })

  const handleCardClick = () => {
    window.open(`/professor/${proffessor._id}`, '_blank')
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const x = e.clientX - centerX
    const y = e.clientY - centerY
    mouseX.set(x)
    mouseY.set(y)
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
    setMousePosition({ x: 0, y: 0 })
  }

  const getNames = (field) => {
    if (!field) return "-"
    if (Array.isArray(field)) {
      const names = field.map((item) => {
        if (!item) return null
        if (typeof item === "string") return item
        if (typeof item === "object" && item.name) return item.name
        return null
      }).filter(Boolean)
      if (names.length === 0) return "-"
      return names.join(", ")
    }
    if (typeof field === "object" && field.name) return field.name
    return String(field)
  }

  
  const stripHtml = (html) => {
    if (!html) return ''
    
    
    const htmlString = String(html)
    
   
    if (!htmlString.includes('<')) {
      return htmlString.trim()
    }
    
    
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlString
    
  
    const text = tempDiv.textContent || tempDiv.innerText || ''
    
    
    return text.replace(/\s+/g, ' ').trim()
  }

  return (
    <motion.div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg cursor-pointer"
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Background Image with Overlay */}
      <div className="relative h-64 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.4 }}
        >
          <img
            src={proffessor.avatar}
            alt={proffessor.fullName}
            className="h-full w-full object-cover"
          />
        </motion.div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Name and Location Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          <motion.h3
            className="text-2xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {proffessor.fullName}
          </motion.h3>
          <motion.div
            className="flex items-center gap-2 text-sm text-white/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MapPin className="h-4 w-4" />
            <span>{getNames(proffessor.location)}</span>
          </motion.div>
        </div>

        {/* Subject Badge */}
        {proffessor.subject && (
          <motion.div
            className="absolute top-4 right-4 z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Badge className="bg-black text-white flex items-center gap-1.5 px-3 py-1.5 shadow-lg border-0">
              <BookOpen className="h-3.5 w-3.5" />
              {getNames(proffessor.subject)}
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Bio */}
        <motion.p
          className="text-sm text-gray-600 line-clamp-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {(() => {
            if (!proffessor.bio) return 'Sin descripción disponible'
            const bioText = stripHtml(proffessor.bio)
            return bioText.length > 0 ? bioText : 'Sin descripción disponible'
          })()}
        </motion.p>

        {/* Price and CTA */}
        <motion.div
          className="flex items-center justify-between pt-4 border-t border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/10">
              <DollarSign className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Precio por hora</p>
              <p className="text-lg font-bold text-black">${proffessor.price || 0}</p>
            </div>
          </div>
          
          <Button
            className="relative overflow-hidden group bg-black text-white hover:bg-gray-800"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleCardClick()
            }}
          >
            <motion.span
              className="relative z-10"
              whileHover={{ scale: 1.05 }}
            >
              Ver perfil
            </motion.span>
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </Button>
        </motion.div>
      </div>

      {/* Hover Glow Effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(
              600px circle at ${mousePosition.x}px ${mousePosition.y}px,
              rgba(0, 0, 0, 0.1),
              transparent 40%
            )`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  )
}

export default ProffessorCard
