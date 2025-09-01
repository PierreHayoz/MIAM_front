import Link from "next/link";

const Buttons = ({ url, text }) => {
    return (
        <Link href={url} className='mt-8 col-start-3 bg-MIAMblack text-MIAMwhite w-fit rounded-full px-4 py-2'>{text}</Link>
    );
}

export default Buttons;
