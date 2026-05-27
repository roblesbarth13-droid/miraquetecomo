import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import logoImage from "@assets/logo-platoamigo.png";

export default function Splash() {
  const [, setLocation] = useLocation();
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    // Si ya vio el splash en esta sesión, ir directo a /home
    if (sessionStorage.getItem("splashShown")) {
      setLocation("/home", { replace: true });
      return;
    }
    sessionStorage.setItem("splashShown", "1");

    const timer = setTimeout(() => {
      setIsAnimationComplete(true);
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAnimationComplete) {
      setLocation("/home", { replace: true });
    }
  }, [isAnimationComplete, setLocation]);

  return (
    <div 
      className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden"
      data-testid="page-splash"
    >
      <div className="flex flex-col items-center justify-center flex-1 z-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.8,
          }}
          className="mb-6"
        >
          <motion.img
            src={logoImage}
            alt="Plato Amigo logo"
            className="h-48 w-48 object-contain"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center"
        >
          <motion.h1 
            className="text-2xl sm:text-4xl md:text-5xl font-bold whitespace-nowrap px-4"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <span className="text-primary">Plato </span>
            <span className="text-accent">Amigo</span>
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-muted-foreground mt-4 text-lg"
        >
          Salvá comida, ahorrá plata
        </motion.p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="h-2 md:h-3 w-full"
          style={{ backgroundColor: "#74ACDF" }}
        />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="h-2 md:h-3 w-full bg-white"
        />
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
          className="h-2 md:h-3 w-full"
          style={{ backgroundColor: "#74ACDF" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute bottom-16 md:bottom-20"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="h-2 w-2 rounded-full bg-primary"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            className="h-2 w-2 rounded-full bg-primary"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            className="h-2 w-2 rounded-full bg-primary"
          />
        </div>
      </motion.div>
    </div>
  );
}
