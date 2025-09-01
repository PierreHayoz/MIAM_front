import React from 'react';
import IllustrationList from '../../components/Illustrations/IllustrationList';

const Page = () => {
    return (
        <div className="px-4">
            <button className="cursor-pointer w-fit h-fit relative  border border-MIAMblack px-3 py-2 group overflow-hidden">
                <div className=" text-MIAM relative z-10">Acheter un billet</div>
                <div className="absolute top-0 bg-MIAMviolet w-full  h-full left-0 px-3 py-2 text-MIAMblack"></div>
            </button>
        </div>
    );
}

export default Page;
