import { ReactNode, useEffect, useState } from "react";

interface HeaderProps {
  className?: string;
  children?: ReactNode;
  texto?: string;
}

export default function Header(props: HeaderProps) {
  const [largeHeight, setLargeHeight] = useState(false);

  useEffect(() => {
    if (window.innerHeight >= 600) setLargeHeight(true);
  }, []);

  return (
    <div className="relative flex justify-center items-center h-[40vh] w-full bg-typography-900 overflow-hidden">
      <header
        className={`flex h-full w-full max-w-[600px] lg:h-full md:h-full brightness-30 ${props.className}`}
      >
        {props.children}
      </header>

      {/* Transição suave entre imagem e o fundo (usa var(--color-surface-200)) */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0) 0%,
              rgb(var(--color-surface-200) / 1) 100%
            )
          `,
        }}
      />

      <div className="flex w-screen justify-center items-center absolute">
        <span className="absolute text-3xl titulo text-white text-center">
          {props.texto}
        </span>
      </div>
    </div>
  );
}
