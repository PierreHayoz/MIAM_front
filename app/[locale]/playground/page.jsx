'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * AudioWaveButton
 *
 * Un bouton qui anime une "onde sonore" (barres verticales) au hover.
 * - Pas de retour d'anim au deshover : les barres s'arrêtent proprement.
 * - Garde le style Tailwind (container relatif, overflow-hidden, etc.).
 * - Couleurs faciles à personnaliser (ex: bg-MIAMlime).
 */
function AudioWaveButton({
  label = "Découvrir l'association",
  className = '', // pour styler le conteneur externe
  textClassName = '', // pour styler le texte
  barColorClass = 'bg-MIAMlime ', // couleur des barres
  bars = 9, // nombre de barres
}) {
  const [isHover, setIsHover] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    // Respecte la préférence utilisateur "réduire les animations"
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      setReduced(mq.matches)
      const onChange = (e) => setReduced(e.matches)
      mq.addEventListener?.('change', onChange)
      return () => mq.removeEventListener?.('change', onChange)
    }
  }, [])

  // Génère des décalages pour chaque barre pour créer l'effet d'onde
  const barDelays = Array.from({ length: bars }, (_, i) => i * 0.05)

  return (
    <div className={`relative w-fit overflow-hidden ${className}`}>
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="cursor-pointer group relative "
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-end gap-1 h-8">
            {Array.from({ length: bars }).map((_, i) => (
              <motion.span
                key={i}
                className={`w-[3px] ${barColorClass} rounded-full block`}
                style={{ height: '100%' }}
                initial={{ scaleY: 0.2, opacity: 0 }}
                animate={
                  isHover && !reduced
                    ? {
                        opacity: 1,
                        scaleY: [0.3, 1, 0.5, 0.9, 0.4, 0.7, 0.3],
                      }
                    : { opacity: 0, scaleY: 0.2 }
                }
                transition={
                  isHover && !reduced
                    ? {
                        duration: 0.9,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: barDelays[i],
                      }
                    : { duration: 0.25, ease: 'easeOut' }
                }
              />
            ))}
          </div>
        </div>


        <div className={`relative z-10 py-1 px-3 ${textClassName}`}>
          {label}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="space-y-6 p-6">
    
      <div className=" w-fit border text-">
        <AudioWaveButton
          className=""
          textClassName=""
          barColorClass="bg-MIAMlime"
          label="Découvrir l'association"
          bars={20}
        />
      </div>
    </div>
  )
}
