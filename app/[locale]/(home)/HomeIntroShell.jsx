'use client';
import { useEffect, useRef, useState } from 'react';
import { useNavData } from '@/app/providers/NavDataProvider';
import Navigation from '@/app/components/navigation/Navigation';
import LogoBarsWave from '@/app/components/LogoBarWave';

export default function HomeIntroShell({ children }) {
    const { nav, locale } = useNavData(); // ⬅️ récupère sans props/cloning

   
    return (
        <>
            <Navigation currentLocale={locale} nav={nav} />
            <LogoBarsWave
                src="/logo/MIAM.svg"
                height={200}
                paddingY={100}
                bars={300}
                amplitude={100}
                frequency={2}
                baseSpeed={1}
                introFreq={2}
                
                introSpeed={0}
                introAmp={1}
                idleInfluence={0}
                hoverRadius={24}
                falloff={0.012}
                maxSpeed={8}
                accelRate={1}
                releaseRate={4}
                fit="contain"
            />
            <section
              
            >
                {children}
            </section>
        </>
    );
}
