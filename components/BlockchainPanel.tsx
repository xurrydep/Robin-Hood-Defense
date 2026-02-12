
import React from 'react';
import { BlockchainState } from '../types';

interface BlockchainPanelProps {
  blockchain: BlockchainState;
  onDeploy: () => void;
  isDeployed: boolean;
}

const BlockchainPanel: React.FC<BlockchainPanelProps> = ({ blockchain, onDeploy, isDeployed }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Connection status light */}
        <div className={`absolute top-0 right-0 w-32 h-1 ${blockchain.isConnected ? 'bg-green-500' : 'bg-red-500'} opacity-30`}></div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${blockchain.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              {blockchain.network}
            </h3>
            <span className="text-[10px] text-gray-600 font-mono mt-1">CHAIN_ID: 46630</span>
          </div>
          <span className="text-[10px] bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20 font-bold uppercase tracking-wider">L2 Active</span>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="bg-black/30 p-4 rounded-xl border border-[#30363d] flex flex-col group transition-all hover:border-green-500/30">
            <div className="flex justify-between items-center">
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Available Balance</span>
               <span className="text-xs font-bold text-green-500">TESTNET ETH</span>
            </div>
            <span className="text-2xl font-mono text-white mt-1 group-hover:text-green-400 transition-colors">{blockchain.balance}</span>
          </div>
          
          {blockchain.isConnected && !isDeployed && (
            <button 
              onClick={onDeploy}
              disabled={blockchain.isDeploying}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 ${
                blockchain.isDeploying 
                ? 'bg-blue-500/20 text-blue-400 cursor-not-allowed border border-blue-500/20' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/40 border border-blue-400/30'
              }`}
            >
              {blockchain.isDeploying ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Broadcasting Deployment...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.503 1.508a2 2 0 01-2.924 1.114l-1.314-.789a2 2 0 00-2.316.08l-1.558 1.168a2 2 0 01-2.733-.274l-1.01-1.01a2 2 0 01-.274-2.733l1.168-1.558a2 2 0 00.08-2.316l-.789-1.314a2 2 0 011.114-2.924l1.508-.503a2 2 0 001.414-1.96l.477-2.387a2 2 0 00.547-1.022l.504-1.512a2 2 0 012.924-1.114l1.314.789a2 2 0 002.316-.08l1.558-1.168a2 2 0 012.733.274l1.01 1.01a2 2 0 01.274 2.733l-1.168 1.558a2 2 0 00-.08 2.316l.789 1.314a2 2 0 01-1.114 2.924l-1.508.503a2 2 0 00-1.414 1.96l-.477 2.387a2 2 0 00-.547 1.022l-.504 1.512z" />
                  </svg>
                  Deploy Defense Contract
                </>
              )}
            </button>
          )}

          {blockchain.isConnected && !isDeployed && (
            <div className="text-[10px] text-gray-500 italic mt-2">
              Note: UI deployment is simulated for demo purposes. To deploy on-chain, follow the README and run the Hardhat deploy (`npm run deploy:robinhood`).
            </div>
          )}

          {isDeployed && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-4 animate-in fade-in duration-700">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-sm text-black font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">L2 Defense Protocol</span>
                <span className="text-[10px] text-gray-300 font-mono mt-0.5">0x71C...32B ACTIVE</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <span>Mempool Activity</span>
            <a
              href={blockchain.address ? `https://explorer.testnet.chain.robinhood.com/address/${blockchain.address}` : 'https://explorer.testnet.chain.robinhood.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              Explorer
              <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            {blockchain.transactions.length === 0 ? (
              <div className="text-center py-8 bg-black/20 rounded-xl border border-dashed border-[#30363d]">
                 <span className="text-gray-600 text-[10px] italic font-medium uppercase tracking-tighter">Waiting for chain events...</span>
              </div>
            ) : (
              blockchain.transactions.map((tx, idx) => (
                <div key={idx} className="bg-black/20 p-3 rounded-lg border border-[#30363d] flex items-center justify-between group hover:bg-black/40 transition-colors">
                  <div className="flex flex-col truncate pr-2">
                    <span className="text-[10px] font-mono text-blue-400 truncate w-32 group-hover:text-blue-300 transition-colors">{tx.hash}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{tx.method}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[9px] font-black tracking-tighter ${tx.status === 'success' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {tx.status.toUpperCase()}
                    </span>
                    <span className="text-[8px] text-gray-600 mt-0.5">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainPanel;
