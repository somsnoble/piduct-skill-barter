// src/pages/TestnetPlayground.jsx
import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { parseEther, formatEther } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';

// Import from your centralized Supabase config
import { supabase } from '../lib/supabase';

const PID_TOKEN = "0xbbdb3de211fe96df0f1974c2c1c848716da7ffdf";
const SKILL_BARTER = "0xc39ba4b1c23bed970b6773189e8ed91e09bbc3c6"; // NEW CONTRACT
const PLATFORM_WALLET = "0x34bbb0a87e9d319ca2a2b6c8e94bb7454f401788";

// Updated ABI for new contract
const PID_ABI = [
  { "inputs": [{ "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "faucet", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

const BARTER_ABI = [
  // Offer functions
  { "inputs": [{ "internalType": "string", "name": "title", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "price", "type": "uint256" }], "name": "createOffer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "getAllOffers", "outputs": [{ "components": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "string", "name": "title", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "price", "type": "uint256" }, { "internalType": "bool", "name": "active", "type": "bool" }], "internalType": "struct SkillBarter.Offer[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" },
  
  // NEW Match functions
  { "inputs": [{ "internalType": "uint256", "name": "offerId", "type": "uint256" }, { "internalType": "string", "name": "message", "type": "string" }], "name": "requestMatch", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "matchId", "type": "uint256" }], "name": "acceptMatch", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "matchId", "type": "uint256" }], "name": "completeMatch", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  
  // View functions
  { "inputs": [], "name": "getMyMatchRequests", "outputs": [{ "components": [{ "internalType": "uint256", "name": "offerId", "type": "uint256" }, { "internalType": "address", "name": "requester", "type": "address" }, { "internalType": "string", "name": "message", "type": "string" }, { "internalType": "bool", "name": "accepted", "type": "bool" }, { "internalType": "bool", "name": "completed", "type": "bool" }], "internalType": "struct SkillBarter.MatchRequest[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "offerId", "type": "uint256" }], "name": "getMatchRequestsForOffer", "outputs": [{ "components": [{ "internalType": "uint256", "name": "offerId", "type": "uint256" }, { "internalType": "address", "name": "requester", "type": "address" }, { "internalType": "string", "name": "message", "type": "string" }, { "internalType": "bool", "name": "accepted", "type": "bool" }, { "internalType": "bool", "name": "completed", "type": "bool" }], "internalType": "struct SkillBarter.MatchRequest[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "matchId", "type": "uint256" }], "name": "getMatchRequest", "outputs": [{ "components": [{ "internalType": "uint256", "name": "offerId", "type": "uint256" }, { "internalType": "address", "name": "requester", "type": "address" }, { "internalType": "string", "name": "message", "type": "string" }, { "internalType": "bool", "name": "accepted", "type": "bool" }, { "internalType": "bool", "name": "completed", "type": "bool" }], "internalType": "struct SkillBarter.MatchRequest", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }
];

export default function TestnetPlayground() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: balance } = useReadContract(address ? { 
    address: PID_TOKEN, 
    abi: PID_ABI, 
    functionName: 'balanceOf', 
    args: [address] 
  } : null);
  
  const { data: offersData, refetch: refetchOffers } = useReadContract({ 
    address: SKILL_BARTER, 
    abi: BARTER_ABI, 
    functionName: 'getAllOffers' 
  });
  
  const [myMatchRequests, setMyMatchRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('offers'); // 'offers' or 'matches'
  const [platformEarnings, setPlatformEarnings] = useState(0);
  const [matching, setMatching] = useState(false);

  const offers = offersData || [];

  // Fetch data on component mount and when address changes
  useEffect(() => {
    if (address) {
      fetchMyMatchRequests();
      fetchPlatformEarnings();
    }
  }, [address]);

  const fetchMyMatchRequests = async () => {
    try {
      const { data } = await supabase
        .from('match_requests')
        .select('*')
        .or(`requester_address.eq.${address?.toLowerCase()},offer_owner_address.eq.${address?.toLowerCase()}`)
        .order('created_at', { ascending: false });
      
      setMyMatchRequests(data || []);
    } catch (error) {
      console.error('Error fetching match requests:', error);
    }
  };

  const fetchPlatformEarnings = async () => {
    const { data, error } = await supabase
      .from('platform_fees')
      .select('fee_amount');
    
    if (!error && data) {
      const total = data.reduce((sum, fee) => sum + parseFloat(fee.fee_amount), 0);
      setPlatformEarnings(total);
    }
  };

  const getFaucet = async () => {
    if (!address) return alert("Connect wallet first");
    try {
      await writeContractAsync({
        address: PID_TOKEN,
        abi: PID_ABI,
        functionName: 'faucet',
        args: [address, parseEther('1000')],
      });
      alert("1000 $PID sent! Enough for 50 matches.");
    } catch {
      alert("Faucet failed — try again");
    }
  };

  const createOffer = async () => {
    if (!title) return alert("Fill title");

    try {
      await writeContractAsync({
        address: SKILL_BARTER,
        abi: BARTER_ABI,
        functionName: 'createOffer',
        args: [title, desc || "No description", parseEther("0")],
      });

      // Save to Supabase
      const { error } = await supabase.from('skills').insert({
        user_address: address?.toLowerCase(),
        title,
        description: desc || "No description",
        category: "general",
        tags: ['Skill Barter'],
        price: 0,
        active: true,
        created_at: new Date().toISOString()
      });

      if (error) {
        console.error("Supabase error:", error);
        alert("On-chain success! Database save failed");
      } else {
        alert("Free offer created!");
      }

      setTitle('');
      setDesc('');
      refetchOffers();
    } catch (err) {
      console.error(err);
      alert("Transaction failed");
    }
  };

  const requestMatch = async (offerId, offerTitle, offerOwner) => {
    if (!address) return alert("Connect wallet first");
    
    setMatching(true);
    try {
      // This will trigger wallet popup for 10 $PID fee
      await writeContractAsync({
        address: SKILL_BARTER,
        abi: BARTER_ABI,
        functionName: 'requestMatch',
        args: [BigInt(offerId), "I'd like to exchange skills!"],
      });

      // Save match request to Supabase
      const { error } = await supabase.from('match_requests').insert({
        offer_id: offerId,
        requester_address: address?.toLowerCase(),
        offer_owner_address: offerOwner?.toLowerCase(),
        offer_title: offerTitle,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      // Record platform fee
      await supabase.from('platform_fees').insert({
        user_address: address?.toLowerCase(),
        fee_amount: 10.00,
        fee_type: 'match_request',
        created_at: new Date().toISOString()
      });

      await fetchPlatformEarnings();
      await fetchMyMatchRequests();
      
      alert("🎉 Match request sent! 10 $PID fee paid. Waiting for offer owner to accept.");
    } catch (err) {
      console.error(err);
      alert("Match request failed");
    } finally {
      setMatching(false);
    }
  };

  const acceptMatch = async (matchId) => {
    try {
      // This will trigger wallet popup for 10 $PID fee
      await writeContractAsync({
        address: SKILL_BARTER,
        abi: BARTER_ABI,
        functionName: 'acceptMatch',
        args: [BigInt(matchId)],
      });

      // Update match request in Supabase
      await supabase.from('match_requests')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', matchId);

      // Record platform fee
      await supabase.from('platform_fees').insert({
        user_address: address?.toLowerCase(),
        fee_amount: 10.00,
        fee_type: 'match_accept',
        created_at: new Date().toISOString()
      });

      await fetchPlatformEarnings();
      await fetchMyMatchRequests();
      
      alert("✅ Match accepted! 10 $PID fee paid. You can now complete the match.");
    } catch (err) {
      console.error(err);
      alert("Accept match failed");
    }
  };

  const completeMatch = async (matchId) => {
    try {
      await writeContractAsync({
        address: SKILL_BARTER,
        abi: BARTER_ABI,
        functionName: 'completeMatch',
        args: [BigInt(matchId)],
      });

      // Update match request in Supabase
      await supabase.from('match_requests')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', matchId);

      alert("🎊 Match completed! Skill exchange successful.");
      await fetchMyMatchRequests();
      refetchOffers();
    } catch (err) {
      console.error(err);
      alert("Complete match failed");
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-8">Piduct Testnet</h1>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent text-center mb-12">
          Piduct Testnet - Perfect UX
        </h1>

        {/* Platform Earnings */}
        <div className="backdrop-blur-lg bg-green-900/20 border border-green-500/30 rounded-2xl p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold text-green-400 mb-2">Platform Earnings</h2>
          <p className="text-4xl font-bold text-green-300">{platformEarnings} $PID</p>
          <p className="text-gray-400 mt-2">Total matching fees (20 $PID per completed match)</p>
        </div>

        {/* Wallet & Faucet */}
        <div className="backdrop-blur-lg bg-gray-900/60 border border-[#A855F7]/30 rounded-2xl p-10 mb-16 text-center">
          <ConnectButton />
          <p className="text-gray-400 mt-6">Wallet: {address?.slice(0, 10)}...{address?.slice(-8)}</p>
          <p className="text-5xl font-bold text-[#A855F7] mt-4">
            {balance ? Number(formatEther(balance)).toFixed(0) : '0'} $PID
          </p>
          <button
            onClick={getFaucet}
            className="mt-8 bg-gradient-to-r from-[#A855F7] to-[#EC4899] px-12 py-5 rounded-xl text-2xl font-bold hover:scale-105 transition"
          >
            Get 1000 Test $PID
          </button>
          <p className="text-gray-400 mt-4 text-sm">
            Enough for 50 match requests (10 $PID fee per request)
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900/60 rounded-xl p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'offers' 
                  ? 'bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Browse Offers
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'matches' 
                  ? 'bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              My Matches ({myMatchRequests.length})
            </button>
          </div>
        </div>

        {activeTab === 'offers' ? (
          <>
            {/* Create Offer */}
            <div className="backdrop-blur-lg bg-gray-900/60 border border-[#A855F7]/30 rounded-2xl p-10 mb-16">
              <h2 className="text-4xl font-bold mb-8 text-center">Create Skill Offer</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <input
                  placeholder="Title (e.g. Web3 UI/UX Design)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-gray-800/70 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:border-[#A855F7] focus:outline-none"
                />
                <button
                  onClick={createOffer}
                  className="bg-gradient-to-r from-[#A855F7] to-[#EC4899] rounded-xl font-bold text-xl hover:scale-105 transition py-4"
                >
                  Create Free Offer
                </button>
              </div>
              <textarea
                placeholder="Describe your skill (optional)"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                className="w-full bg-gray-800/70 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:border-[#A855F7] focus:outline-none"
              />
              <p className="text-green-400 text-center mt-4">
                💫 Listing is completely free! Earn when people match with you.
              </p>
            </div>

            {/* Browse Offers */}
            <h2 className="text-4xl font-bold text-center mb-12">Available Skill Offers</h2>
            {offers.length === 0 ? (
              <p className="text-center text-gray-400 text-2xl py-20">
                No offers yet — be the first!
              </p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {offers.filter((o) => o.active).map((offer, i) => (
                  <div key={i} className="backdrop-blur-lg bg-gray-900/60 border border-[#A855F7]/30 rounded-2xl p-8 hover:border-[#A855F7] transition">
                    <h3 className="text-2xl font-bold text-white mb-3">{offer.title}</h3>
                    <p className="text-gray-300 mb-6">{offer.description || 'No description'}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-lg text-green-400 font-bold mb-2">
                          🆓 Free Skill Exchange
                        </p>
                        <p className="text-sm text-yellow-400 mb-1">
                          💰 10 $PID to request match
                        </p>
                        <p className="text-sm text-gray-500">
                          by {offer.owner?.slice(0, 8)}...{offer.owner?.slice(-6)}
                        </p>
                      </div>
                      <button
                        onClick={() => requestMatch(i, offer.title, offer.owner)}
                        disabled={matching}
                        className="bg-gradient-to-r from-[#A855F7] to-[#EC4899] px-8 py-4 rounded-xl font-bold hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {matching ? 'Processing...' : 'Request Match'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* My Matches Tab */
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-center mb-12">My Match Requests</h2>
            
            {myMatchRequests.length === 0 ? (
              <p className="text-center text-gray-400 text-2xl py-20">
                No match requests yet.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {myMatchRequests.map((match) => (
                  <div key={match.id} className="backdrop-blur-lg bg-gray-900/60 border border-[#A855F7]/30 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{match.offer_title}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {match.requester_address === address?.toLowerCase() 
                            ? `You requested match with ${match.offer_owner_address?.slice(0, 8)}...`
                            : `${match.requester_address?.slice(0, 8)}... requested match with you`
                          }
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        match.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        match.status === 'accepted' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {match.status}
                      </span>
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                      {match.requester_address === address?.toLowerCase() ? (
                        // User requested this match
                        match.status === 'pending' ? (
                          <button disabled className="bg-gray-600 px-4 py-2 rounded-lg text-gray-400">
                            Waiting for acceptance
                          </button>
                        ) : match.status === 'accepted' ? (
                          <button 
                            onClick={() => completeMatch(match.id)}
                            className="bg-gradient-to-r from-[#A855F7] to-[#EC4899] px-4 py-2 rounded-lg font-bold hover:scale-105 transition"
                          >
                            Complete Match
                          </button>
                        ) : (
                          <button disabled className="bg-green-600 px-4 py-2 rounded-lg text-green-300">
                            Completed
                          </button>
                        )
                      ) : (
                        // User owns this offer
                        match.status === 'pending' ? (
                          <button 
                            onClick={() => acceptMatch(match.id)}
                            className="bg-gradient-to-r from-[#A855F7] to-[#EC4899] px-4 py-2 rounded-lg font-bold hover:scale-105 transition"
                          >
                            Accept Match (10 $PID)
                          </button>
                        ) : match.status === 'accepted' ? (
                          <button 
                            onClick={() => completeMatch(match.id)}
                            className="bg-gradient-to-r from-[#A855F7] to-[#EC4899] px-4 py-2 rounded-lg font-bold hover:scale-105 transition"
                          >
                            Complete Match
                          </button>
                        ) : (
                          <button disabled className="bg-green-600 px-4 py-2 rounded-lg text-green-300">
                            Completed
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}