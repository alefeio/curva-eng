import { useRouter } from "next/router";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

export default function WhatsAppButton() {
    const router = useRouter();

    const handleClick = (pg: string) => {
        router.push(pg);
    };

    return (
        <div className="fixed flex justify-between gap-2 bottom-4 right-4 z-30">
            <a
                href="https://www.instagram.com/mydress.aluguel"
                target="_blank"
                rel="noopener noreferrer"
                className="z-10 bg-primary   hover:bg-primary text-white rounded-full shadow-lg p-3 font-bold text-lg transition"
                onClick={() => handleClick('/instagram')}
            >
                <FaInstagram className="w-7 h-7 text-primary" />
            </a>
            <a
                href="https://wa.me//5591985810208?text=Gostaria de mais informações. Estou entrando em contato através do site."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary   hover:bg-primary text-white rounded-full shadow-lg p-3 font-bold text-lg transition"
                onClick={() => handleClick('/whatsapp')}
            >
                <FaWhatsapp className="w-7 h-7 text-primary" />
            </a>
        </div>
    )
}