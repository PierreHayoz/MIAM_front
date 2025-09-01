import React from 'react';
import Buttons from '../button/Buttons';
import Image from 'next/image';
import Paragraphs from '../paragraphs/Paragraphs';

const AssociationSection = ({ type, title, text, buttonText, image }) => {
    return (
        <section className='grid grid-cols-4 px-4 py-4 '>
            {type === "left" &&
                <Image src={image} width={1920} height={1080} className='col-span-2 grayscale contrast-[1000%] brightness-[300%]' />
            }
            <div className={`${type === 'left' ? "pl-4" : "pr-4"} flex flex-col justify-between `}>
                <div className={`sticky top-20 mb-14`}>
                    <Paragraphs text={text} title={title}/>
                    
                </div>
                <Buttons text={buttonText} url="/association" />
            </div>
            {type === "right" &&
                <div className='col-span-2 relative'>
                    <div className="bg-MIAMblack h-full w-full absolute top-0 left-0 z-10 mix-blend-hardlight"></div>
                    <Image src={image} width={1920} height={1080} className='grayscale contrast-[1000%] brightness-[150%]'/>
                </div>
            }
        </section>
    );
}

export default AssociationSection;
