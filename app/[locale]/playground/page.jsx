'use client';
export default function Home() {
    return <div className="group relative rounded-full w-fit mx-4 overflow-hidden ">
        <div className="w-full h-full absolute bg-black   -top-full  group-hover:top-0 transition-all duration-500 mix-blend-difference"></div>
        <div className="z-10 relative h-full w-full py-1 bg-black text-white px-3 group-hover:-translate-y-full  translate-y-0 transition-all duration-500">Découvrir l'association</div>
        <div className="z-10 absolute h-full w-full bg-white py-1 px-3 group-hover:top-0 top-full mix-blend-difference duration-500 transition-all text-black ">Découvrir l'association</div>
    </div>
}
