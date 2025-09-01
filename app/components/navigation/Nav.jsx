
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import LanguageSwitcher from "../locales/LanguageSwitcher";
const items = [
    { url: "/programme", title: "Programme" },
    { url: "/association", title: "L'association" },
    { url: "/espace", title: "L'espace" },
    { url: "/contact", title: "Contact" },
];

export default async function Nav() {

    return (
        <div
            className="w-full fixed top-0 left-0 flex justify-between items-center py-4 z-[100] border-b-1 bg-MIAMwhite px-4"
        >
            <Image src="/logo/MIAM.svg" width={300} height={300}className="w-32"/>

                <ul
                    className=" backdrop-blur-xl flex gap-1 p-1 rounded-full"
                >
                    {items.map((item) => {
                        return (
                            <li key={item.url} className="relative">
                                <Link
                                    href={item.url}
                                    className={`inline-flex h-10 items-center px-3 leading-none rounded-full outline-none transition-colors ${current ? "text-white" : "hover:bg-MIAMblack/10"
                                        }`}
                                >
                                    {item.title}
                                </Link>
                            </li>
                        );
                    })}
                    <LanguageSwitcher/>
                </ul>
        </div>
    );
}
