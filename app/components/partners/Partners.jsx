import React from 'react';

const Partners = () => {
    return (
        <div className="h-full">
            <div className='grid grid-cols-4 px-4 space-y-10'>
                <div className="pr-4">
                    <h2 className="text-xl col-span-1">Partenariats et collaborations</h2>
                    <p className='text-MIAMgrey'>MIAM s’entoure de partenaires visionnaires qui partagent notre passion pour l’art immersif et l’innovation sonore.</p>
                </div>
                
                <div className="col-span-2 gap-2">
                    <div className="">Partenaires</div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="h-32 w-full bg-MIAMlightgrey"></div>
                        <div className="h-32 w-full bg-MIAMlightgrey"></div>
                        <div className="h-32 w-full bg-MIAMlightgrey"></div>
                        <div className="h-32 w-full bg-MIAMlightgrey"></div>
                        <div className="h-32 w-full bg-MIAMlightgrey"></div>
                        <div className="h-32 w-full bg-MIAMlightgrey"></div>
                    </div>
                    
                </div>
                <div className="col-span-2 gap-2 col-start-2">
                    <div className="">Collaborations</div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="h-32 w-full bg-MIAMlightgrey"></div>
                        <div className="h-32 w-full bg-MIAMlightgrey"></div>
                        <div className="h-32 w-full bg-MIAMlightgrey"></div>
                        <div className="h-32 w-full bg-MIAMlightgrey"></div>
                        <div className="h-32 w-full bg-MIAMlightgrey"></div>
                        <div className="h-32 w-full bg-MIAMlightgrey"></div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}

export default Partners;
