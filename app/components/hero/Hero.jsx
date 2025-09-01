import Image from 'next/image';
import React from 'react';

const Hero = () => {
    return (
        <div className='grid grid-cols-4 py-40'>
            <div className="col-span-2 col-start-2">
            <Image src='/logo/MIAM.svg' width={1000} height={800} className='w-full'/>
            </div>
        </div>
    );
}

export default Hero;
