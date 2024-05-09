import Image from "next/image";

export const images = [
    {
        id: 1,
        title: "UIT",
        src: "/uit.svg"
    },
    {
        id: 2,
        title: "CS",
        src: "/cs.svg"
    },
    {
        id: 3,
        title: "MMLab",
        src: "/mmlab.svg"
    }
]

const Logos = () => {
    return (
        <div className="flex gap-4 py-2 px-4">
            {images.map(({ id, title, src }) => (
                <Image src={src} key={id} alt={title} height={0} width={0} className="object-contain h-6 w-8"/>
            ))}
        </div>
    )
}

export default Logos;