
import React from 'react';
import { BlockchainState } from '../types';

interface HeaderProps {
  blockchain: BlockchainState;
  onConnect: () => void;
}

const Header: React.FC<HeaderProps> = ({ blockchain, onConnect }) => {
  return (
    <header className="bg-[#0d1117]/80 backdrop-blur-md border-b border-[#30363d] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-green-500 rounded-lg blur group-hover:blur-md transition-all opacity-20"></div>
          <div className="relative w-10 h-10 bg-[#161b22] border border-green-500/50 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div>
          <h1 className="text-xl font-medieval text-white tracking-wide flex items-center gap-2">
            ROBIN HOOD <span className="text-green-500 font-sans font-bold text-xs bg-green-500/10 px-2 py-0.5 rounded">DEFENSE</span>
          </h1>
          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.3em]">Built on Robinhood Chain</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {blockchain.isConnected ? (
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Chain ID: 0xRH</span>
              <span className="text-xs font-mono text-blue-400">{blockchain.balance}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#161b22] px-4 py-2 rounded-xl border border-[#30363d] shadow-inner">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-xs font-mono text-gray-300">{blockchain.address}</span>
            </div>
          </div>
        ) : (
          <button 
            onClick={onConnect}
            className="px-6 py-2.5 bg-white hover:bg-gray-100 text-black font-bold rounded-xl transition-all text-sm flex items-center gap-2 shadow-lg"
          >
            Connect to Robinhood
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
