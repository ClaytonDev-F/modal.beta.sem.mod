"use client";

import { useAccount } from "wagmi";
import '@reown/appkit-wallet-button/react'; // Importação do componente

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen px-8 py-0 pb-12 flex-1 flex flex-col items-center bg-white">
      <header className="w-full py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="hidden sm:inline text-xl font-bold">reown AppKit example app</div>
        </div>
        <div className="flex items-center">
          {/* @ts-ignore */}
          <w3m-button /> {/* Agora o erro deve ser ignorado */}
        </div>
      </header>
    </main>
  );
}
