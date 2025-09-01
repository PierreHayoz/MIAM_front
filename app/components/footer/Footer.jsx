import Image from 'next/image';
import React from 'react';
import Newsletter from '../newsletter/Newsletter';

const Footer = () => {
    return (
        <div className='w-full md:grid grid-cols-4 p-4 flex flex-col md:gap-0 gap-4'>
            <div className="col-span-4 md:col-span-1">
                <Newsletter />
            </div>
            <div className="col-start-3">
                <ul>
                    <li>Contact</li>
                    <li className='text-MIAMgreytext text-'>Immersive Space</li>
                    <li className='text-MIAMgreytext text-'>Avenue du Général Guisan 1</li>
                    <li className='text-MIAMgreytext text-'>1700 Fribourg, Suisse</li>
                </ul>
            </div>
            <div >
                <ul>
                    <li>Réseaux sociaux</li>
                    <li className='text-MIAMgreytext text-'>Instagram</li>
                    <li className='text-MIAMgreytext text-'>Facebook</li>
                    <li className='text-MIAMgreytext text-'>Youtube</li>
                </ul>
            </div>
            <Image
                className='col-span-5 pt-16'
                src="/logo/MIAM.svg"
                alt="Logo de l'appli"
                width={1920}
                height={24}
                priority />
        </div>
    );
}

export default Footer;
