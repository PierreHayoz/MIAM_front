'use client';
import { useEffect, useRef, useState } from 'react';
import LogoBarsWave from '@/app/components/LogoBarWave';

export default function Home() {
    const [showNav, setShowNav] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const navRef = useRef(null);

    // Quand l'intro finit → afficher la nav
    const handleIntroEnd = () => setShowNav(true);

    // Quand la nav a fini sa transition → afficher le contenu
    useEffect(() => {
        const el = navRef.current;
        if (!el) return;

        const onEnd = (e) => {
            // on ne déclenche que pour l'opacité (évite les multiples appels)
            if (e.propertyName === 'opacity') {
                setShowContent(true);
            }
        };

        el.addEventListener('transitionend', onEnd);
        return () => el.removeEventListener('transitionend', onEnd);
    }, []);

    // Fallback sécurité (au cas où transitionend ne part pas)
    useEffect(() => {
        if (showNav && !showContent) {
            const id = setTimeout(() => setShowContent(true), 500); // = durée transition
            return () => clearTimeout(id);
        }
    }, [showNav, showContent]);

    return (
        <main>
            {/* HERO / INTRO */}
            <LogoBarsWave
                src="/logo/MIAM.svg"
                height={200}
                paddingY={100}
                bars={140}
                amplitude={100}
                frequency={2}
                baseSpeed={1}
                introFreq={2}
                // intro
                introDuration={0}
                settleDuration={3000}
                introSpeed={0}
                introAmp={1}
                idleInfluence={0}
                hoverRadius={24}
                falloff={0.012}
                maxSpeed={8}
                accelRate={1}
                releaseRate={4}
                fit="contain"
                onIntroEnd={handleIntroEnd}
            />

            {/* NAV */}
            <nav
                ref={navRef}
                aria-hidden={!showNav}
                style={{
                    position: 'fixed',
                    top: 0,
                    width:"100%",
                    zIndex: 10,
                    background: '#fff',
                    padding: 16,
                    opacity: showNav ? 1 : 0,
                    transform: `translateY(${showNav ? 0 : -8}px)`,
                    transition: 'opacity 500ms ease, transform 500ms ease',
                    pointerEvents: showNav ? 'auto' : 'none',
                }}
            >
                <ul style={{ display: 'flex',justifyContent:"center", gap: 16, margin: 0, padding: 0, listStyle: 'none' }}>
                    <li><a href="#work">Work</a></li>
                    <li><a href="#studio">Studio</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>

            <section
                aria-hidden={!showContent}
                className='grid grid-cols-2'
                style={{
                    opacity: showContent ? 1 : 0,
                    transform: `translateY(${showContent ? 0 : 8}px)`,
                    transition: 'opacity 500ms ease, transform 500ms ease',
                    pointerEvents: showContent ? 'auto' : 'none',
                    minHeight: '120vh',
                    padding: '48px 24px',
                }}
            >
                <div className="">
                    <h1 className='text-xl' style={{ marginTop: 0 }}>Notre programme</h1>
                <p className='text-MIAMgreytext pb-4'>D’ici quelques années, MIAM sera reconnu à l’international pour la qualité de son espace, de ses productions et de ses créations. L’association aura contribué à populariser la création immersive pluridisciplinaire (son, image, corps, espace) et évoluera en réseau avec de nombreuses institutions culturelles, participant à la diffusion d’œuvres de renom.</p>
                <p className='text-MIAMgreytext pb-4'>Dans le même mouvement, MIAM rassemblera un large public, attiré à la fois par le caractère unique des événements proposés et par l’accueil chaleureux du lieu, contribuant ainsi au rayonnement de la scène culturelle locale.</p>
            
                </div>
                </section>
        </main>
    );
}
