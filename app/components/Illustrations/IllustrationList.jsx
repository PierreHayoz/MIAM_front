

"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useScroll, useTransform, motion } from "framer-motion";

const items = Array.from({ length: 30 }, (_, i) =>
    `/illustrations/Illu_30_web-${String(i + 1).padStart(2, "0")}.svg`
);

function pick3(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, 3);
}

export default function IllustrationList() {
    const { scrollYProgress } = useScroll({
        offset: ['start start', 'end start']

    })
    const y = useTransform(scrollYProgress, [0, 1], ["-60%", "20%"])
    const pathname = usePathname();
    const searchParams = useSearchParams(); // optionnel
    const [three, setThree] = useState([]);

    useEffect(() => {
        setThree(pick3(items));
    }, [pathname, searchParams]); // ⇦ re-pioche à chaque navigation

    return (
        <div className="w-full fixed h-screen bottom-0 left-0 -z-1 ">
            <motion.div style={{ y }} className="gap-4 p-4 h-[400vh] w-full ">
                {three.map((src, i) => (
                    <div className="">
                        <Image
                        priority
                            key={src}
                            src={src}
                            alt={`Illustration ${i + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-full opacity-4"
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
