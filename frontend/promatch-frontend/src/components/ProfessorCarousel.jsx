import { useEffect, useRef } from 'react'
import ProffessorCard from './ProffessorCard'

const ProfessorCarousel = ({ professors }) => {
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || professors.length === 0) return

    let scrollPosition = 0
    const scrollSpeed = 0.5 
    const cardWidth = 352 + 32 
    const halfWidth = (cardWidth * professors.length)
    let intervalId = null
    let isPaused = false
    
    const scroll = () => {
      if (!container || isPaused) return
      
      scrollPosition += scrollSpeed
      
      
      if (scrollPosition >= halfWidth) {
        scrollPosition = 0
      }
      
      container.scrollLeft = scrollPosition
    }

  
    intervalId = setInterval(scroll, 16) 

   
    const handleMouseEnter = () => {
      isPaused = true
    }
    const handleMouseLeave = () => {
      isPaused = false
    }

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      if (intervalId) clearInterval(intervalId)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [professors])

  if (!professors || professors.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <h3 className="text-2xl font-bold text-black mb-6">Profesores recomendados para ti</h3>
      <div
        ref={scrollContainerRef}
        className="flex gap-8 overflow-x-hidden scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Duplicar los items para crear efecto de loop infinito */}
        {[...professors, ...professors].map((professor, index) => (
          <div key={`${professor._id}-${index}`} className="flex-shrink-0 w-80">
            <ProffessorCard proffessor={professor} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfessorCarousel
