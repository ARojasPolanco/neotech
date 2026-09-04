import { motion } from "framer-motion";
import { Instagram, MessageCircle } from "lucide-react";

const LINKS = {
  instagram: "https://www.instagram.com/neo.tech.bb?igsi=MWR4YzE2YnZhNDBvMg%3D%3D&utm_source=qr",
  whatsapp: "https://whatsapp.com/channel/0029Vb9D5SzKgsNr2QO3sk1j",
};

export default function SlideSocialMedia() {
  return (
    <div className="relative flex h-full min-h-[280px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 px-6 py-16 text-center text-white sm:min-h-[340px]">
      <div className="relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
        >
          Seguinos para{" "}
          <span className="text-accent">ofertas y promos</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-4 max-w-md text-base text-white/70 sm:text-lg"
        >
          Enterate de las mejores ofertas y novedades antes que nadie.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <a
            href={LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <Instagram size={20} />
            Instagram
          </a>
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <MessageCircle size={20} />
            WhatsApp
          </a>
        </motion.div>
      </div>
    </div>
  );
}
