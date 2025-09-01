import React from 'react';

const Newsletter = () => {
    return (
        <div className=''>
            <h2 className='text-xl leading-tight pb-4'>Abonne toi à notre newsletter<br />pour ne rien manquer</h2>
            <div className="bg-MIAMlightgrey rounded-full flex p-2 w-fit">
                <input type="mail" className='pl-1 w-full' placeholder='hello@mail.ch' />
                <div className="bg-MIAMblack text-MIAMwhite w-fit rounded-full px-2">s'abonner</div>
            </div>
        </div>
    );
}

export default Newsletter;
