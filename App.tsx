
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, BlockchainState, Transaction } from './types';
import Game from './components/Game';
import BlockchainPanel from './components/BlockchainPanel';
import Header from './components/Header';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    health: 100,
    level: 1,
    isGameOver: false,
    isGameStarted: false,
    isContractDeployed: false,
  });

  const [blockchain, setBlockchain] = useState<BlockchainState>({
    isConnected: false,
    address: null,
    balance: '0.00 ETH',
    network: 'Robinhood Chain Testnet',
    transactions: [],
    isDeploying: false,
  });

  const [aiTip, setAiTip] = useState<string>("Analyzing Sherwood's network state...");

  const fetchStrategy = useCallback(async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Medieval high-fantasy strategy for a Robin Hood defense game. Enemies are Orcs, Uruk-hai, and Trolls. Context: Robinhood Chain (Ethereum L2), deploying smart contracts for magical shields. Current Score: ${gameState.score}. Level: ${gameState.level}. Deployed: ${gameState.isContractDeployed}.`,
      });
      setAiTip(response.text || "Burn the Uruk-hai before they breach the wall.");
    } catch (error) {
      setAiTip("Aim for the eyes, Ranger!");
    }
  }, [gameState.score, gameState.level, gameState.isContractDeployed]);

  useEffect(() => {
    if (gameState.isGameStarted && !gameState.isGameOver) {
      const interval = setInterval(fetchStrategy, 30000);
      fetchStrategy();
      return () => clearInterval(interval);
    }
  }, [gameState.isGameStarted, gameState.isGameOver, fetchStrategy]);

  const connectWallet = async () => {
    const anyWindow: any = window;
    const provider = anyWindow.ethereum;
    if (!provider) {
      alert('No Ethereum provider found. Install MetaMask or a compatible wallet.');
      return;
    }

    const desiredChainId = '0xB626'; // 46630 decimal

    try {
      // Request account access from the wallet (avoid experimental permission flows)
      const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];

      // Ensure correct network (Robinhood Chain Testnet)
      const currentChain = await provider.request({ method: 'eth_chainId' });
      if (currentChain !== desiredChainId) {
        try {
          await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: desiredChainId }] });
        } catch (switchError: any) {
          console.error('wallet_switchEthereumChain error:', switchError);
          // If the chain is not added, request adding it
          if (switchError?.code === 4902 || /Unrecognized chain/i.test(switchError?.message || '')) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: desiredChainId,
                  chainName: 'Robinhood Chain Testnet',
                  rpcUrls: ['https://rpc.testnet.chain.robinhood.com'],
                  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                  blockExplorerUrls: ['https://explorer.testnet.chain.robinhood.com']
                }]
              });
            } catch (addErr: any) {
              console.error('wallet_addEthereumChain failed:', addErr);
              alert('Ağı otomatik ekleyemedik. Lütfen cüzdanınıza manuel olarak aşağıdaki bilgileri ekleyin:\n\n' +
                'Network Name: Robinhood Chain Testnet\n' +
                'RPC URL: https://rpc.testnet.chain.robinhood.com\n' +
                'Chain ID: 46630 (0xB626)\n' +
                'Currency Symbol: ETH\n' +
                'Explorer: https://explorer.testnet.chain.robinhood.com');
            }
          } else {
            throw switchError;
          }
        }
      }

      // Read balance (wei hex) and convert to ETH
      const balanceHex: string = await provider.request({ method: 'eth_getBalance', params: [address, 'latest'] });
      const wei = BigInt(balanceHex);
      const balanceNum = Number(wei) / 1e18;

      setBlockchain(prev => ({
        ...prev,
        isConnected: true,
        address,
        balance: `${balanceNum.toFixed(4)} ETH`,
        network: 'Robinhood Chain Testnet'
      }));

      // Listen for account / network changes
      provider.on && provider.on('accountsChanged', (accounts: string[]) => {
        if (!accounts || accounts.length === 0) {
          setBlockchain(prev => ({ ...prev, isConnected: false, address: null }));
        } else {
          setBlockchain(prev => ({ ...prev, address: accounts[0] }));
        }
      });

      provider.on && provider.on('chainChanged', (chainId: string) => {
        if (chainId !== desiredChainId) {
          setBlockchain(prev => ({ ...prev, isConnected: false, network: `Unknown (${chainId})` }));
        } else {
          setBlockchain(prev => ({ ...prev, network: 'Robinhood Chain Testnet' }));
        }
      });

    } catch (error: any) {
      console.error('connectWallet error', error);
      const msg = error?.message || String(error);
      // Specific guidance for MetaMask merged permissions error
      if (msg.includes('Invalid merged permissions') || msg.includes('endowment:caip25')) {
        alert('MetaMask izin hatası algılandı. Lütfen MetaMask\n-> Settings -> Security & Privacy -> Connected sites\nüzerinden bu siteyi (localhost) kaldırıp tekrar bağlanmayı deneyin.\nAyrıca farklı bir tarayıcı profili veya port deneyin.');
      } else {
        alert('Cüzdan bağlanamadı. Konsolde daha fazla bilgi var. Hata: ' + msg);
      }
    }
  };

  const addTransaction = (method: string, status: 'pending' | 'success' = 'pending') => {
    const newTx: Transaction = {
      hash: '0x' + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10),
      method,
      status,
      timestamp: Date.now(),
    };
    setBlockchain(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions].slice(0, 10),
    }));
    return newTx.hash;
  };

  const deployContract = () => {
    if (!blockchain.isConnected || blockchain.isDeploying) return;
    
    setBlockchain(prev => ({ ...prev, isDeploying: true }));
    const txHash = addTransaction('Deploy: MithrilShield.sol');

    setTimeout(() => {
      setBlockchain(prev => ({
        ...prev,
        isDeploying: false,
        balance: '0.482 ETH', 
        transactions: prev.transactions.map(tx => 
          tx.hash === txHash ? { ...tx, status: 'success' } : tx
        )
      }));
      setGameState(prev => ({ ...prev, isContractDeployed: true }));
    }, 2500);
  };

  const startGame = () => {
    if (!blockchain.isConnected) return;
    setGameState({
      score: 0,
      health: 100,
      level: 1,
      isGameOver: false,
      isGameStarted: true,
      isContractDeployed: false,
    });
  };

  const onGameOver = () => {
    setGameState(prev => ({ ...prev, isGameOver: true }));
    if (blockchain.isConnected) {
      addTransaction('Record: ValorousDefense', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col selection:bg-green-500/30">
      <Header blockchain={blockchain} onConnect={connectWallet} />

      <main className="flex-grow flex flex-col lg:flex-row gap-6 p-4 max-w-7xl mx-auto w-full">
        <div className="flex-grow lg:w-2/3 flex flex-col gap-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl relative border-t-2 border-t-blue-500/50 min-h-[500px]">
            {!gameState.isGameStarted ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-slate-950">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                
                <div className="relative z-10">
                  <div className="w-28 h-28 mb-8 mx-auto bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/30 shadow-[0_0_60px_rgba(59,130,246,0.2)] group transition-all duration-700">
                    <span className="text-6xl group-hover:scale-110 transition-transform">🏹</span>
                  </div>
                  
                  <h2 className="text-7xl font-medieval mb-3 text-white tracking-tighter drop-shadow-lg">Robin Hood Defense</h2>
                  <p className="text-blue-400 font-bold tracking-[0.5em] text-[10px] uppercase mb-10">Robinhood L2 • Testnet Siege</p>
                  
                  <div className="max-w-md mx-auto mb-12 space-y-6">
                    <p className="text-slate-300 leading-relaxed text-xl font-light">
                      The dark legions of Mordor approach. Deploy your <span className="text-blue-400 font-bold">Mithril Smart Contracts</span> to hold the line.
                    </p>
                    
                    {!blockchain.isConnected && (
                      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-400 text-sm flex items-center gap-3 justify-center backdrop-blur-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Identity Verification Required via Wallet.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    {!blockchain.isConnected ? (
                      <button 
                        onClick={connectWallet}
                        className="px-12 py-5 bg-white hover:bg-slate-100 text-black rounded-2xl font-black text-lg transition-all shadow-2xl flex items-center gap-3 transform hover:-translate-y-1"
                      >
                        Connect Robinhood Wallet
                      </button>
                    ) : (
                      <button 
                        onClick={startGame}
                        className="px-14 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-2xl transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] transform hover:scale-105 flex items-center gap-4 border-b-4 border-blue-800"
                      >
                        Defend Sherwood
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Game 
                gameState={gameState} 
                setGameState={setGameState} 
                onGameOver={onGameOver}
              />
            )}
          </div>

          <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-2xl flex items-center gap-5 shadow-2xl backdrop-blur-sm">
            <div className="relative">
               <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center">
                <span className="text-3xl">🧝</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-4 border-[#161b22] animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">Elven Scout Report</h3>
              <p className="italic text-slate-200 text-sm leading-snug">"{aiTip}"</p>
            </div>
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col gap-6">
          <BlockchainPanel 
            blockchain={blockchain} 
            onDeploy={deployContract}
            isDeployed={gameState.isContractDeployed}
          />
          
          <div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-3xl border-l-4 border-l-blue-600 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] font-black text-blue-400 flex items-center gap-2 uppercase tracking-widest">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Deploy L2 Infrastructure
              </h3>
            </div>
            
            <div className="bg-black/60 p-4 rounded-2xl font-mono text-[11px] text-blue-200/90 leading-relaxed overflow-x-auto border border-blue-500/10 shadow-inner">
              <div className="text-blue-500/40 mb-2">// Robinhood Chain ID: 46630</div>
              <div><span className="text-purple-400">contract</span> <span className="text-yellow-400">ArcherGuard</span> {`{`}</div>
              <div className="pl-4 text-blue-400/60">// Passive Shielding active</div>
              <div className="pl-4"><span className="text-purple-400">function</span> <span className="text-yellow-400">deployDefense</span>() {`{`}</div>
              <div className="pl-8 text-green-400">shieldActive = true;</div>
              <div className="pl-4">{`}`}</div>
              <div>{`}`}</div>
            </div>
            
            <div className="mt-5 space-y-3">
               <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 uppercase font-black">RPC Status</span>
                  <span className="text-green-500 font-bold">12ms Latency</span>
               </div>
               <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 uppercase font-black">L2 Gas Price</span>
                  <span className="text-slate-300">0.000021 Gwei</span>
               </div>
            </div>
          </div>
        </div>
      </main>
      
      <style>{`
        @font-face {
          font-family: 'MedievalSharp';
          font-style: normal;
        }
        body {
          cursor: default;
        }
      `}</style>
    </div>
  );
};

export default App;
