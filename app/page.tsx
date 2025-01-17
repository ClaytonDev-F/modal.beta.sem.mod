"use client";

import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient, useDisconnect } from "wagmi";
import { createPublicClient, http, getContract, parseUnits } from 'viem';
import { bsc } from 'viem/chains';
import '@reown/appkit-wallet-button/react';

const MY_CONTRACT_ADDRESS = "0xe92A6c8d1393992c45b97866C81BBFB13D1bd720";
const USDT_CONTRACT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

const myContractABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
    ],
    name: "buyTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const usdtContractABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export default function Home() {
  const { address, isConnected } = useAccount(); // Obtenção do endereço da conta
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();
  const [dollarAmount, setDollarAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [error, setError] = useState("");
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    if (dollarAmount) {
      const tokens = Number(dollarAmount) / 0.001;
      setTokenAmount(tokens.toString());
    } else {
      setTokenAmount("");
    }
  }, [dollarAmount]);

  const handleBuyTokens = async () => {
    if (!walletClient || !address) {
      setError("Carteira não conectada ou cliente não disponível");
      return;
    }

    try {
      const usdtCost = Number(tokenAmount) * 0.001;
      if (usdtCost <= 0) return;

      setIsBuying(true);
      const publicClient = createPublicClient({
        chain: bsc,
        transport: http(),
      });

      const myContractInstance = getContract({
        address: MY_CONTRACT_ADDRESS,
        abi: myContractABI,
        client: publicClient,
      });

      const usdtContractInstance = getContract({
        address: USDT_CONTRACT_ADDRESS,
        abi: usdtContractABI,
        client: publicClient,
      });

      await walletClient.writeContract({
        ...usdtContractInstance,
        functionName: "approve",
        args: [MY_CONTRACT_ADDRESS, parseUnits(usdtCost.toString(), 18)],
      });

      await walletClient.writeContract({
        ...myContractInstance,
        functionName: "buyTokens",
        args: [parseUnits(tokenAmount.toString(), 18)],
      });

      console.log("Tokens comprados com sucesso!");
      setError("");
    } catch (error) {
      console.error("Erro ao comprar tokens:", error);
      setError("Ocorreu um erro ao comprar tokens.");
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <main className="min-h-screen px-8 py-0 pb-12 flex-1 flex flex-col items-center bg-white">
      <header className="w-full py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="hidden sm:inline text-xl font-bold">reown AppKit example app</div>
        </div>
        <div className="flex items-center">
          {/* @ts-ignore */}
          <w3m-button />
        </div>
      </header>

      <div className="flex flex-col items-center mt-8">
        <input
          type="number"
          placeholder="Investment in USDT"
          value={dollarAmount}
          onChange={(e) => setDollarAmount(e.target.value)}
          className="border rounded p-2 mb-4"
        />
        <input
          type="number"
          placeholder="Tokens you will receive"
          value={tokenAmount}
          readOnly
          className="border rounded p-2 mb-4"
        />
        {isConnected && (
          <button
            onClick={handleBuyTokens}
            className="bg-teal-500 text-white font-bold py-2 px-4 rounded"
            disabled={isBuying}
          >
            {isBuying ? "Buying..." : "Buy Tokens"}
          </button>
        )}
        {!isConnected && (
          <div className="text-red-500">Please connect your wallet to buy tokens.</div>
        )}
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>
    </main>
  );
}