import Image from 'next/image';

const Illustration = ({url}) => {
    return <Image alt={url} src={url} width={400} height={400} />
}

export default Illustration;
