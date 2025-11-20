import React, { useState, useEffect } from 'react';
import { 
  Wallet, Menu, X, ArrowRightLeft, User, Tag, ChevronRight, Plus, Edit, Trash2, Search,
  LayoutDashboard, Home, FileText, Users, Briefcase, MessageSquare, Settings, LogOut,
  LayoutGrid, Database, ShieldCheck, HardDrive, PieChart, Lock, Send, Paperclip, Link as LinkIcon,
  Award, Twitter, Instagram, Youtube
} from 'lucide-react';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, ConnectButton, darkTheme } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';
import { parseEther, formatEther } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { supabase } from "./lib/supabase";
// Supabase
import { createClient } from '@supabase/supabase-js';

// LIVE CONTRACTS
const PID_TOKEN = "0xbbdb3de211fe96df0f1974c2c1c848716da7ffdf";
const SKILL_BARTER = "0xb994181db8fe1049ce45db3b93c63b01cebf62fe";

// ABIs
const PID_ABI = [
  { "inputs": [{ "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "faucet", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

const BARTER_ABI = [
  { "inputs": [{ "internalType": "string", "name": "title", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "price", "type": "uint256" }], "name": "createOffer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "offerId", "type": "uint256" }], "name": "acceptOffer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "getAllOffers", "outputs": [{ "components": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "string", "name": "title", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "price", "type": "uint256" }, { "internalType": "bool", "name": "active", "type": "bool" }], "internalType": "struct SkillBarter.Offer[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }
];

const config = createConfig({
  chains: [sepolia],
  transports: { [sepolia.id]: http() },
});

const queryClient = new QueryClient();

// DESIGN SYSTEM
const PrimaryButton = ({ children, onClick, className = '' }) => (
  <button onClick={onClick} className={`rounded-lg bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white font-bold px-6 py-3 hover:scale-105 transition ${className}`}>
    {children}
  </button>
);

const SecondaryButton = ({ children, onClick, className = '' }) => (
  <button onClick={onClick} className={`rounded-lg border border-[#A855F7] text-[#A855F7] font-bold px-6 py-3 hover:bg-[#A855F7]/10 transition ${className}`}>
    {children}
  </button>
);

const GlassCard = ({ children, className = '' }) => (
  <div className={`backdrop-blur-lg bg-gray-900/50 border border-[#A855F7]/30 rounded-xl p-6 ${className}`}>
    {children}
  </div>
);

const StyledInput = ({ className = '', ...props }) => (
  <input className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#A855F7] ${className}`} {...props} />
);

const StyledSelect = ({ className = '', ...props }) => (
  <select className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#A855F7] ${className}`} {...props} />
);

const StyledTextarea = ({ className = '', ...props }) => (
  <textarea className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#A855F7] ${className}`} {...props} />
);

// NAVBAR
const Navbar = ({ setPage }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: 'Home', page: 'home', icon: Home },
    { name: 'Match', page: 'match', icon: Users },
    { name: 'Categories', page: 'categories', icon: LayoutGrid },
    { name: 'Stake', page: 'stake', icon: Database },
    { name: 'Testnet', page: 'testnet', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/60 border-b border-[#A855F7]/30">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        <div onClick={() => setPage('home')} className="cursor-pointer">
          <img src="https://i.postimg.cc/28qRCY2Z/pidd-removebg-preview.png" alt="Piduct" className="h-10" />
        </div>

        <nav className="hidden md:flex gap-8">
          {navItems.map(item => (
            <button key={item.page} onClick={() => setPage(item.page)} className="flex items-center gap-2 text-gray-300 hover:text-[#A855F7] transition font-medium">
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ConnectButton />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
            {mobileOpen ? <X size={28} className="text-gray-300" /> : <Menu size={28} className="text-gray-300" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-black/90 border-t border-[#A855F7]/30 p-6">
          {navItems.map(item => (
            <button key={item.page} onClick={() => { setPage(item.page); setMobileOpen(false); }} className="block w-full text-left py-3 text-gray-300 hover:text-[#A855F7]">
              <item.icon className="inline mr-3" size={20} /> {item.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

// TESTNET PAGE
const TestnetPage = () => {
  const { address, isConnected } = useAccount();

  const { data: balance } = useReadContract(address ? { 
    address: PID_TOKEN, 
    abi: PID_ABI, 
    functionName: 'balanceOf', 
    args: [address], 
    chainId: sepolia.id 
  } : null);
  
  const { data: offers = [], refetch } = useReadContract({ 
    address: SKILL_BARTER, 
    abi: BARTER_ABI, 
    functionName: 'getAllOffers', 
    chainId: sepolia.id 
  });

  const { writeContractAsync } = useWriteContract();

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');

  const getFaucet = async () => {
    try {
      await writeContractAsync({ 
        address: PID_TOKEN, 
        abi: PID_ABI, 
        functionName: 'faucet', 
        args: [address, parseEther('1000')], 
        chainId: sepolia.id 
      });
      alert("1000 $PID sent!");
    } catch (error) {
      console.error("Faucet error:", error);
      alert("Error getting faucet tokens");
    }
  };

  const createOffer = async () => {
    try {
      await writeContractAsync({ 
        address: PID_TOKEN, 
        abi: PID_ABI, 
        functionName: 'approve', 
        args: [SKILL_BARTER, parseEther('999999')], 
        chainId: sepolia.id 
      });
      await writeContractAsync({ 
        address: SKILL_BARTER, 
        abi: BARTER_ABI, 
        functionName: 'createOffer', 
        args: [title || "Test Skill", desc || "Available", parseEther(price || "10")], 
        chainId: sepolia.id 
      });
      alert("Offer created!");
      refetch();
    } catch (error) {
      console.error("Create offer error:", error);
      alert("Error creating offer");
    }
  };

  const acceptOffer = async (id, priceAmount) => {
    try {
      await writeContractAsync({ 
        address: PID_TOKEN, 
        abi: PID_ABI, 
        functionName: 'approve', 
        args: [SKILL_BARTER, priceAmount], 
        chainId: sepolia.id 
      });
      await writeContractAsync({ 
        address: SKILL_BARTER, 
        abi: BARTER_ABI, 
        functionName: 'acceptOffer', 
        args: [BigInt(id)], 
        chainId: sepolia.id 
      });
      alert("Match successful! 10 $PID spent");
      refetch();
    } catch (error) {
      console.error("Accept offer error:", error);
      alert("Error accepting offer");
    }
  };

  if (!isConnected) return <div className="text-center py-40 text-4xl text-white">Connect wallet to use testnet</div>;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-6xl font-bold bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent mb-10">
        Piduct Testnet - Live on Sepolia
      </h1>

      <GlassCard className="mb-10 p-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400">Wallet</p>
            <p className="font-mono text-xl break-all">{address}</p>
            <p className="text-5xl font-bold text-[#A855F7] mt-4">
              {balance ? Number(formatEther(balance)).toFixed(0) : '0'} $PID
            </p>
          </div>
          <PrimaryButton onClick={getFaucet}>Get 1000 Test $PID</PrimaryButton>
        </div>
      </GlassCard>

      <GlassCard className="mb-10 p-8">
        <h2 className="text-3xl font-bold mb-6">Create Offer</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <input 
            placeholder="Title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white" 
          />
          <input 
            placeholder="Price in $PID" 
            value={price} 
            onChange={e => setPrice(e.target.value)} 
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white" 
          />
          <PrimaryButton onClick={createOffer}>Create Offer</PrimaryButton>
        </div>
        <textarea 
          placeholder="Description" 
          value={desc} 
          onChange={e => setDesc(e.target.value)} 
          rows={3} 
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white" 
        />
      </GlassCard>

      <h2 className="text-4xl font-bold mb-8">Live Offers</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {offers.filter(o => o.active).map((offer, i) => (
          <GlassCard key={i} className="p-8">
            <h3 className="text-2xl font-bold">{offer.title}</h3>
            <p className="text-gray-400 mt-2">{offer.description || 'No description'}</p>
            <p className="text-4xl font-bold text-[#A855F7] mt-6">
              {offer.price ? Number(formatEther(offer.price)).toFixed(2) : '0'} $PID
            </p>
            <PrimaryButton onClick={() => acceptOffer(i, offer.price)} className="mt-6 w-full">
              Match Now
            </PrimaryButton>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

// CATEGORY SKILL LIST PAGE
const CategorySkillListPage = ({ setPage, categoryId }) => {
  const categoryNames = {
    development: 'Development',
    design: 'Design',
    marketing: 'Marketing',
    writing: 'Writing & Translation',
    audio: 'Audio & Music',
    video: 'Video & Animation',
    community: 'Community & Social',
    other: 'Other'
  };

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, [categoryId]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('category', categoryId)
        .eq('active', true);

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="flex items-center gap-4">
          <button onClick={() => setPage('categories')} className="text-gray-400 hover:text-white">
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <h1 className="text-4xl font-bold">{categoryNames[categoryId] || 'Category'} Skills</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-2xl text-[#A855F7]">Loading skills...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4">
        <button onClick={() => setPage('categories')} className="text-gray-400 hover:text-white">
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <h1 className="text-4xl font-bold">{categoryNames[categoryId] || 'Category'} Skills</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <GlassCard key={skill.id} className="p-5 flex flex-col justify-between h-full">
            <div>
              <h3 className="font-semibold text-lg text-white mb-2">{skill.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <User size={16} />
                <span>{skill.user_address?.slice(0, 6)}...{skill.user_address?.slice(-4)}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {skill.tags?.map((tag) => (
                  <span key={tag} className="bg-[#A855F7]/20 text-[#D8B4FE] rounded-full px-3 py-1 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-gray-300 text-sm mb-4">{skill.description}</p>
            </div>
            <SecondaryButton onClick={() => {}} className="w-full mt-2">
              View Details
            </SecondaryButton>
          </GlassCard>
        ))}
        {skills.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <div className="text-xl text-gray-400">No skills found in this category</div>
          </div>
        )}
      </div>
    </div>
  );
};

// HOME PAGE
const HomePage = ({ setPage, onOpenModal }) => {
  const [featuredSkills, setFeaturedSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedSkills();
  }, []);

  const fetchFeaturedSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('active', true)
        .limit(3);

      if (error) throw error;
      setFeaturedSkills(data || []);
    } catch (error) {
      console.error('Error fetching featured skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Development', icon: HardDrive, page: 'development' },
    { name: 'Design', icon: PieChart, page: 'design' },
    { name: 'Marketing', icon: PieChart, page: 'marketing' },
    { name: 'Writing', icon: Edit, page: 'writing' },
  ];

  return (
    <div className="space-y-24 py-16 px-4">
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent">
            Trade Skills,
          </span>
          {' '}
          Not Money.
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          Piduct is a Web3 marketplace where your talent is your currency.
          Barter, build reputation, and earn $PID.
        </p>
        <div className="flex justify-center gap-4">
          <PrimaryButton className="hover:!bg-white hover:!text-[#A855F7] hover:!from-white hover:!to-white">Explore Skills</PrimaryButton>
          <SecondaryButton onClick={() => onOpenModal('connect')}>Connect Wallet</SecondaryButton>
        </div>
      </section>

      <section className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard className="p-6 text-center">
            <Wallet size={48} className="mx-auto text-[#A855F7] mb-4" />
            <h3 className="text-2xl font-semibold mb-2">1. Connect</h3>
            <p className="text-gray-400">Connect your Web3 wallet to create your decentralized identity.</p>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <Briefcase size={48} className="mx-auto text-[#A855F7] mb-4" />
            <h3 className="text-2xl font-semibold mb-2">2. List & Request</h3>
            <p className="text-gray-400">List the skills you offer and request the skills you need.</p>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <Users size={48} className="mx-auto text-[#A855F7] mb-4" />
            <h3 className="text-2xl font-semibold mb-2">3. Match</h3>
            <p className="text-gray-400">Our algorithm finds your perfect barter match. Accept to start.</p>
          </GlassCard>
        </div>
      </section>

      <section className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <GlassCard 
              key={cat.name} 
              className="p-6 hover:bg-gray-800/50 transition-colors cursor-pointer"
              onClick={() => setPage(`category/${cat.page}`)}
            >
              <cat.icon size={48} className="mx-auto text-[#EC4899] mb-4" />
              <h3 className="text-2xl font-semibold mb-2">{cat.name}</h3>
            </GlassCard>
          ))}
        </div>
        <div className="text-center mt-8">
          <PrimaryButton className="hover:!bg-white hover:!text-[#A855F7] hover:!from-white hover:!to-white" onClick={() => setPage('categories')}>
            View All Categories
          </PrimaryButton>
        </div>
      </section>

      <section className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Featured Skills</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl text-[#A855F7]">Loading featured skills...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSkills.map((skill) => (
              <GlassCard key={skill.id} className="p-5 flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-semibold text-lg text-white mb-2">{skill.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <User size={16} />
                    <span>{skill.user_address?.slice(0, 6)}...{skill.user_address?.slice(-4)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skill.tags?.map((tag) => (
                      <span key={tag} className="bg-[#A855F7]/20 text-[#D8B4FE] rounded-full px-3 py-1 text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <SecondaryButton onClick={() => {}} className="w-full mt-2">
                  View Details
                </SecondaryButton>
              </GlassCard>
            ))}
            {featuredSkills.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <div className="text-xl text-gray-400">No featured skills available</div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

// DASHBOARD PAGE
const DashboardPage = ({ setPage, onOpenModal }) => {
  const { address } = useAccount();
  const [userSkills, setUserSkills] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [activeMatches, setActiveMatches] = useState([]);

  useEffect(() => {
    if (address) {
      fetchUserData();
    }
  }, [address]);

  const fetchUserData = async () => {
    try {
      // Fetch user skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .eq('user_address', address?.toLowerCase());

      if (!skillsError) setUserSkills(skillsData || []);

      // Fetch user requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select('*')
        .eq('user_address', address?.toLowerCase());

      if (!requestsError) setUserRequests(requestsData || []);

      // Fetch active matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_address.eq.${address?.toLowerCase()},user2_address.eq.${address?.toLowerCase()}`)
        .eq('status', 'active');

      if (!matchesError) setActiveMatches(matchesData || []);

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-bold">Your Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Active Matches</h2>
            <div className="space-y-4">
              {activeMatches.length > 0 ? activeMatches.map(match => (
                <GlassCard key={match.id} className="p-4 bg-gray-800/50 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">Match with {match.user1_address === address?.toLowerCase() ? match.user2_address : match.user1_address}</p>
                    <p className="text-sm text-gray-400">Started {new Date(match.created_at).toLocaleDateString()}</p>
                  </div>
                  <PrimaryButton onClick={() => setPage('chat')} className="!px-3 !py-1.5">
                    Open Chat
                  </PrimaryButton>
                </GlassCard>
              )) : (
                <p className="text-gray-400">You have no active matches.</p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Your Skills & Requests</h2>
            <div className="space-y-4">
              {userSkills.map(skill => (
                <GlassCard key={skill.id} className="p-4 bg-gray-800/50 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">{skill.title}</p>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-700/50 text-green-300">
                      Skill Offer
                    </span>
                  </div>
                  <SecondaryButton onClick={() => setPage('skills')} className="!px-3 !py-1.5">
                    Manage
                  </SecondaryButton>
                </GlassCard>
              ))}
              {userRequests.map(request => (
                <GlassCard key={request.id} className="p-4 bg-gray-800/50 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">{request.title}</p>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-700/50 text-blue-300">
                      Request
                    </span>
                  </div>
                  <SecondaryButton onClick={() => setPage('requests')} className="!px-3 !py-1.5">
                    Manage
                  </SecondaryButton>
                </GlassCard>
              ))}
              {userSkills.length === 0 && userRequests.length === 0 && (
                <p className="text-gray-400">You have no skills or requests listed.</p>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-8">
          <GlassCard className="p-6 text-center">
            <h3 className="text-lg text-gray-400 mb-2">$PID Balance</h3>
            <p className="text-5xl font-bold text-[#A855F7] mb-6">0 $PID</p>
            <PrimaryButton onClick={() => setPage('wallet')} className="w-full mb-2">
              Manage Wallet
            </PrimaryButton>
            <SecondaryButton onClick={() => onOpenModal('buy')} className="w-full">
              Buy $PID
            </SecondaryButton>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <PrimaryButton onClick={() => setPage('skills')} className="w-full !justify-start !gap-3">
                <Plus size={18} /> Add New Skill
              </PrimaryButton>
              <PrimaryButton onClick={() => setPage('requests')} className="w-full !justify-start !gap-3">
                <Plus size={18} /> Add New Request
              </PrimaryButton>
              <SecondaryButton onClick={() => setPage('match')} className="w-full !justify-start !gap-3">
                <Search size={18} /> Find a Match
              </SecondaryButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

// CATEGORIES PAGE
const CategoriesPage = ({ setPage }) => {
  const categories = [
    { name: 'Development', icon: HardDrive, page: 'development', skills: 124 },
    { name: 'Design', icon: PieChart, page: 'design', skills: 230 },
    { name: 'Marketing', icon: PieChart, page: 'marketing', skills: 88 },
    { name: 'Writing & Translation', icon: Edit, page: 'writing', skills: 150 },
    { name: 'Audio & Music', icon: PieChart, page: 'audio', skills: 45 },
    { name: 'Video & Animation', icon: PieChart, page: 'video', skills: 92 },
    { name: 'Community & Social', icon: Users, page: 'community', skills: 67 },
    { name: 'Other', icon: LayoutGrid, page: 'other', skills: 31 },
  ];

  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-bold">All Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <GlassCard 
            key={cat.name} 
            className="p-6 hover:bg-gray-800/50 transition-colors cursor-pointer"
            onClick={() => setPage(`category/${cat.page}`)}
          >
            <cat.icon size={48} className="text-[#EC4899] mb-4" />
            <h3 className="text-2xl font-semibold mb-1">{cat.name}</h3>
            <p className="text-gray-400">{cat.skills} skills listed</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

// SKILLS PAGE
const SkillsPage = () => {
  const { address } = useAccount();
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      fetchMySkills();
    }
  }, [address]);

  const fetchMySkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_address', address?.toLowerCase());

      if (error) throw error;
      setMySkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    const formData = new FormData(e.target);
    const title = formData.get('title');
    const category = formData.get('category');
    const description = formData.get('description');
    const tags = formData.get('tags').split(',').map(tag => tag.trim());

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('skills')
        .insert([
          {
            title,
            category,
            description,
            tags,
            user_address: address.toLowerCase(),
            active: true,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;
      
      alert('Skill added successfully!');
      e.target.reset();
      fetchMySkills();
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Error adding skill');
    } finally {
      setLoading(false);
    }
  };

  const deleteSkill = async (skillId) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;
      
      alert('Skill deleted successfully!');
      fetchMySkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Error deleting skill');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section>
        <h1 className="text-4xl font-bold mb-8">Add a New Skill</h1>
        <GlassCard className="p-6">
          <form className="space-y-4" onSubmit={handleAddSkill}>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Skill Title</label>
              <StyledInput name="title" placeholder="e.g., Smart Contract Auditing" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Category</label>
              <StyledSelect name="category" required>
                <option value="">Select a category...</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="writing">Writing & Translation</option>
                <option value="audio">Audio & Music</option>
                <option value="video">Video & Animation</option>
                <option value="community">Community & Social</option>
                <option value="other">Other</option>
              </StyledSelect>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Description</label>
              <StyledTextarea name="description" placeholder="Describe what you offer..." required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Tags (comma separated)</label>
              <StyledInput name="tags" placeholder="e.g., Solidity, Security, Audit" required />
            </div>
            <PrimaryButton type="submit" className="w-full md:w-auto" disabled={loading}>
              {loading ? 'Adding Skill...' : 'Add Skill'}
            </PrimaryButton>
          </form>
        </GlassCard>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8">Your Listed Skills</h2>
        <div className="space-y-4">
          {mySkills.map(skill => (
            <GlassCard key={skill.id} className="p-4 flex flex-col md:flex-row justify-between md:items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">{skill.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{skill.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skill.tags?.map(tag => (
                    <span key={tag} className="bg-[#A855F7]/20 text-[#D8B4FE] rounded-full px-3 py-1 text-xs font-medium">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <SecondaryButton className="!p-2">
                  <Edit size={18} />
                </SecondaryButton>
                <SecondaryButton 
                  className="!p-2 !text-red-400 hover:!border-red-400"
                  onClick={() => deleteSkill(skill.id)}
                >
                  <Trash2 size={18} />
                </SecondaryButton>
              </div>
            </GlassCard>
          ))}
          {mySkills.length === 0 && (
            <p className="text-gray-400 text-center py-8">You haven't listed any skills yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

// REQUESTS PAGE
const RequestsPage = () => {
  const { address } = useAccount();
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      fetchMyRequests();
    }
  }, [address]);

  const fetchMyRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('user_address', address?.toLowerCase());

      if (error) throw error;
      setMyRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleAddRequest = async (e) => {
    e.preventDefault();
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    const formData = new FormData(e.target);
    const title = formData.get('title');
    const category = formData.get('category');
    const description = formData.get('description');
    const tags = formData.get('tags').split(',').map(tag => tag.trim());

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('requests')
        .insert([
          {
            title,
            category,
            description,
            tags,
            user_address: address.toLowerCase(),
            active: true,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;
      
      alert('Request added successfully!');
      e.target.reset();
      fetchMyRequests();
    } catch (error) {
      console.error('Error adding request:', error);
      alert('Error adding request');
    } finally {
      setLoading(false);
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      
      alert('Request deleted successfully!');
      fetchMyRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Error deleting request');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section>
        <h1 className="text-4xl font-bold mb-8">Add a New Request</h1>
        <GlassCard className="p-6">
          <form className="space-y-4" onSubmit={handleAddRequest}>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Request Title</label>
              <StyledInput name="title" placeholder="e.g., Need Smart Contract Audit" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Category</label>
              <StyledSelect name="category" required>
                <option value="">Select a category...</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="writing">Writing & Translation</option>
                <option value="audio">Audio & Music</option>
                <option value="video">Video & Animation</option>
                <option value="community">Community & Social</option>
                <option value="other">Other</option>
              </StyledSelect>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Description</label>
              <StyledTextarea name="description" placeholder="Describe what you need..." required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Tags (comma separated)</label>
              <StyledInput name="tags" placeholder="e.g., Solidity, Security, Audit" required />
            </div>
            <PrimaryButton type="submit" className="w-full md:w-auto" disabled={loading}>
              {loading ? 'Adding Request...' : 'Add Request'}
            </PrimaryButton>
          </form>
        </GlassCard>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8">Your Listed Requests</h2>
        <div className="space-y-4">
          {myRequests.map(req => (
            <GlassCard key={req.id} className="p-4 flex flex-col md:flex-row justify-between md:items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">{req.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{req.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {req.tags?.map(tag => (
                    <span key={tag} className="bg-[#A855F7]/20 text-[#D8B4FE] rounded-full px-3 py-1 text-xs font-medium">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt=4 md:mt-0">
                <SecondaryButton className="!p-2">
                  <Edit size={18} />
                </SecondaryButton>
                <SecondaryButton 
                  className="!p-2 !text-red-400 hover:!border-red-400"
                  onClick={() => deleteRequest(req.id)}
                >
                  <Trash2 size={18} />
                </SecondaryButton>
              </div>
            </GlassCard>
          ))}
          {myRequests.length === 0 && (
            <p className="text-gray-400 text-center py-8">You haven't listed any requests yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

// MATCH PAGE
const MatchPage = ({ onOpenModal }) => {
  const { address } = useAccount();
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const findMatches = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      // This is a simplified matching algorithm
      const { data: userSkills, error: skillsError } = await supabase
        .from('skills')
        .select('category, tags')
        .eq('user_address', address?.toLowerCase());

      if (skillsError) throw skillsError;

      const userCategories = userSkills?.map(skill => skill.category) || [];
      const userTags = userSkills?.flatMap(skill => skill.tags) || [];

      // Find requests that match user's skills
      const { data: matchingRequests, error: requestsError } = await supabase
        .from('requests')
        .select('*')
        .neq('user_address', address?.toLowerCase())
        .eq('active', true)
        .in('category', userCategories);

      if (requestsError) throw requestsError;

      // Format as potential matches
      const matches = matchingRequests?.map(request => ({
        id: request.id,
        mySkill: userSkills[0]?.title || 'Your Skills',
        theirSkill: request.title,
        user: { 
          name: request.user_address?.slice(0, 6) + '...' + request.user_address?.slice(-4),
          address: request.user_address 
        }
      })) || [];

      setPotentialMatches(matches);
    } catch (error) {
      console.error('Error finding matches:', error);
      alert('Error finding matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    findMatches();
  }, [address]);

  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-bold">Find Your Match</h1>
      
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4">
        <StyledSelect>
          <option>Based on: My Skills</option>
          <option>Based on: My Requests</option>
        </StyledSelect>
        <StyledSelect>
          <option>For Skill: All My Skills</option>
          <option>For Skill: Web3 UI/UX Design</option>
          <option>For Skill: React Development</option>
        </StyledSelect>
        <PrimaryButton onClick={findMatches} className="md:w-auto w-full" disabled={loading}>
          <Search size={18} className="inline-block mr-2" />
          {loading ? 'Finding Matches...' : 'Find Matches'}
        </PrimaryButton>
      </GlassCard>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-2xl text-[#A855F7]">Finding matches...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {potentialMatches.map(match => (
            <GlassCard key={match.id} className="p-5">
              <div className="flex items-center justify-center text-center mb-4">
                <div className="flex-1">
                  <span className="text-sm text-gray-400">Your Skill</span>
                  <h4 className="font-semibold text-white">{match.mySkill}</h4>
                </div>
                <ArrowRightLeft size={24} className="text-[#A855F7] mx-4 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-gray-400">Their Need</span>
                  <h4 className="font-semibold text-white">{match.theirSkill}</h4>
                </div>
              </div>
              <div className="border-t border-[#A855F7]/30 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                  <User size={16} />
                  <span>{match.user.name} ({match.user.address})</span>
                </div>
                <PrimaryButton onClick={() => onOpenModal('match')} className="w-full">
                  Match Now (Costs 10 $PID)
                </PrimaryButton>
              </div>
            </GlassCard>
          ))}
          {potentialMatches.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <div className="text-xl text-gray-400">No matches found. Try adding more skills or check back later.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// WALLET PAGE
const WalletPage = () => {
  const transactions = [
    { id: 1, type: 'Match Fee', amount: -10, date: '2025-11-08' },
    { id: 2, type: 'Swap ETH -> $PID', amount: 500, date: '2025-11-07' },
    { id: 3, type: 'Staking Reward', amount: 15.5, date: '2025-11-06' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <h1 className="text-4xl font-bold">Your $PID Wallet</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard className="p-6">
          <h3 className="text-lg text-gray-400 mb-2">Total Balance</h3>
          <p className="text-6xl font-bold text-[#A855F7] mb-6">0 $PID</p>
          <div className="space-y-3">
            <PrimaryButton className="w-full">Deposit (Not Implemented)</PrimaryButton>
            <SecondaryButton className="w-full">Withdraw (Not Implemented)</SecondaryButton>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold text-white mb-6">Buy $PID</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">You Pay (ETH)</label>
              <StyledInput type="number" placeholder="0.0" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">You Receive ($PID)</label>
              <StyledInput type="number" placeholder="0.0" readOnly />
            </div>
            <p className="text-sm text-gray-400">1 ETH ≈ 1500 $PID</p>
            <PrimaryButton className="w-full">Confirm Swap</PrimaryButton>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">Transaction History</h2>
        <div className="space-y-3">
          {transactions.map(tx => (
            <div key={tx.id} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg">
              <div>
                <p className="font-medium text-white">{tx.type}</p>
                <p className="text-sm text-gray-400">{tx.date}</p>
              </div>
              <p className={`font-semibold text-lg ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} $PID
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

// SETTINGS PAGE
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'portfolio', name: 'Portfolio', icon: Briefcase },
    { id: 'certificates', name: 'Certificates', icon: Award },
    { id: 'security', name: 'Security', icon: ShieldCheck },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Username</label>
              <StyledInput placeholder="e.g., Web3_Wizard" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Bio / Headline</label>
              <StyledInput placeholder="e.g., Senior Solidity Developer & UI/UX Enthusiast" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Full Bio</label>
              <StyledTextarea placeholder="Tell the community about yourself..." />
            </div>
            <PrimaryButton>Save Profile</PrimaryButton>
          </form>
        );
      case 'portfolio':
        return (
          <div className="space-y-6">
            <p className="text-gray-400">Showcase your best work. (e.g., Dribbble, GitHub, Behance)</p>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Portfolio Item Title</label>
                <StyledInput placeholder="e.g., NFT Marketplace Design" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Link (URL)</label>
                <StyledInput type="url" placeholder="https://..." />
              </div>
              <PrimaryButton>Add Portfolio Item</PrimaryButton>
            </form>
          </div>
        );
      case 'certificates':
        return (
          <div className="space-y-6">
            <p className="text-gray-400">Add verified certificates. (e.g., ConsenSys, Alchemy, OpenZeppelin)</p>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Certificate Title</label>
                <StyledInput placeholder="e.g., Solidity Bootcamp" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Issuing Organization</label>
                <StyledInput placeholder="e.g., Alchemy University" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Credential URL</label>
                <StyledInput type="url" placeholder="https://..." />
              </div>
              <PrimaryButton>Add Certificate</PrimaryButton>
            </form>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Account Security</h3>
            <p className="text-gray-400">Your account is secured by your connected wallet. To change accounts, disconnect and reconnect with a new wallet.</p>
            <SecondaryButton className="!text-red-400">Disconnect Wallet</SecondaryButton>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <h1 className="text-4xl font-bold">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <GlassCard className="p-3 md:w-1/4 h-fit">
          <nav className="flex flex-col space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-gradient-to-r from-[#A855F7]/30 to-[#EC4899]/30 text-white' 
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}
                `}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </GlassCard>

        <GlassCard className="p-6 md:w-3/4">
          {renderTabContent()}
        </GlassCard>
      </div>
    </div>
  );
};

// STAKE VAULT PAGE
const StakeVaultPage = () => {
  const [amount, setAmount] = useState('');

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <h1 className="text-4xl font-bold">Stake $PID Vault</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg text-gray-400 mb-2">Total $PID Staked</h3>
          <p className="text-4xl font-bold text-white">1,234,567</p>
        </GlassCard>
        <GlassCard className="p-6">
          <h3 className="text-lg text-gray-400 mb-2">Annual Percentage Rate (APY)</h3>
          <p className="text-4xl font-bold text-[#A855F7]">12.5%</p>
        </GlassCard>
        <GlassCard className="p-6">
          <h3 className="text-lg text-gray-400 mb-2">Your Staked Balance</h3>
          <p className="text-4xl font-bold text-white">5,000</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold text-white mb-6">Stake $PID</h2>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Amount to Stake</label>
              <StyledInput 
                type="number" 
                placeholder="0.0 $PID"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-sm text-gray-400 mt-1">Your Wallet Balance: 100 $PID</p>
            </div>
            <PrimaryButton className="w-full">Stake</PrimaryButton>
          </form>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold text-white mb-6">Unstake $PID</h2>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Amount to Unstake</label>
              <StyledInput type="number" placeholder="0.0 $PID" />
              <p className="text-sm text-gray-400 mt-1">Your Staked Balance: 5,000 $PID</p>
            </div>
            <SecondaryButton className="w-full">Unstake</SecondaryButton>
          </form>
        </GlassCard>
      </div>

      <GlassCard className="p-6 flex flex-col md:flex-row justify-between md:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">Your Unclaimed Rewards</h2>
          <p className="text-4xl font-bold text-[#EC4899] mt-2">123.45 $PID</p>
        </div>
        <PrimaryButton className="mt-4 md:mt-0">Claim Rewards</PrimaryButton>
      </GlassCard>
    </div>
  );
};

// CHAT PAGE
const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const contacts = [
    { id: 1, name: 'Solidity_God', lastMessage: 'Hey, I checked your design...', online: true },
    { id: 2, name: 'DAO_Head', lastMessage: 'Are you available for a quick call?', online: false },
    { id: 3, name: 'Blender_Master', lastMessage: 'Here\'s the first draft of the 3D model.', online: true },
  ];
  
  const messages = [
    { id: 1, sender: 'other', text: 'Hey, I checked your design on Figma. Looks great!' },
    { id: 2, sender: 'me', text: 'Awesome! Glad you like it. Ready for the contract dev?' },
    { id: 3, sender: 'other', text: 'Yep, starting now. I\'ll send an update by EOD.' },
  ];

  const currentChat = contacts.find(c => c.id === selectedChat);

  return (
    <div className="flex h-[calc(100vh_-_10rem)] max-w-7xl mx-auto">
      <GlassCard className="w-1/3 min-w-80 h-full flex flex-col">
        <div className="p-4 border-b border-[#A855F7]/30">
          <h2 className="text-2xl font-semibold text-white">Your Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => setSelectedChat(contact.id)}
              className={`w-full text-left p-4 border-b border-gray-800/50
                ${selectedChat === contact.id ? 'bg-gray-800/50' : 'hover:bg-gray-800/30'}
              `}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-white">{contact.name}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${contact.online ? 'bg-green-400' : 'bg-gray-500'}`}></span>
              </div>
              <p className="text-sm text-gray-400 truncate">{contact.lastMessage}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="w-2/3 h-full flex flex-col ml-4">
        {currentChat ? (
          <>
            <div className="p-4 border-b border-[#A855F7]/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A855F7] to-[#EC4899] flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{currentChat.name}</h3>
                  <span className={`text-sm ${currentChat.online ? 'text-green-400' : 'text-gray-500'}`}>
                    {currentChat.online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <SecondaryButton onClick={() => {}} className="!px-3 !py-1.5">
                View Profile
              </SecondaryButton>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-xs md:max-w-md p-3 rounded-xl
                      ${msg.sender === 'me' 
                        ? 'bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white' 
                        : 'bg-gray-700 text-gray-200'}
                    `}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#A855F7]/30">
              <div className="flex items-center gap-3">
                <StyledInput placeholder="Type your message..." className="flex-1" />
                <SecondaryButton className="!p-3">
                  <Paperclip size={20} />
                </SecondaryButton>
                <PrimaryButton className="!p-3">
                  <Send size={20} />
                </PrimaryButton>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-lg">Select a chat to start messaging</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

// PUBLIC PROFILE PAGE
const PublicProfilePage = ({ setPage }) => {
  const profile = {
    name: 'Solidity_God',
    address: '0x1a2b...c3d4',
    bio: 'Senior Solidity Developer & UI/UX Enthusiast. Audited 20+ protocols.',
    reputation: 4.8,
    reviews: 12,
    skills: [
      { id: 1, title: 'Smart Contract Auditing', tags: ['Solidity', 'Security', 'Audit'] },
      { id: 2, title: 'Solana Rust Development', tags: ['Rust', 'Solana', 'Web3'] },
    ],
    portfolio: [
      { id: 1, title: 'DeFi Lending Protocol Audit', link: '#' },
      { id: 2, title: 'NFT Marketplace on Solana', link: '#' },
    ],
    certificates: [
      { id: 1, title: 'ConsenSys Solidity Bootcamp', org: 'ConsenSys' },
      { id: 2, title: 'OpenZeppelin Security Fellow', org: 'OpenZeppelin' },
    ]
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <GlassCard className="p-8 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#A855F7] to-[#EC4899] flex-shrink-0 flex items-center justify-center">
          <User size={64} className="text-white" />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold text-white">{profile.name}</h1>
          <p className="text-lg text-gray-400 font-mono mt-1">{profile.address}</p>
          <p className="text-gray-300 mt-3">{profile.bio}</p>
          <div className="flex justify-center md:justify-start items-center gap-4 mt-4">
            <span className="font-bold text-2xl text-[#EC4899]">★ {profile.reputation}</span>
            <span className="text-gray-400">({profile.reviews} reviews)</span>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Skills Offered</h2>
            <div className="space-y-4">
              {profile.skills.map(skill => (
                <GlassCard key={skill.id} className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-2">{skill.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {skill.tags.map((tag) => (
                        <span key={tag} className="bg-[#A855F7]/20 text-[#D8B4FE] rounded-full px-3 py-1 text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <SecondaryButton className="w-full mt-2">
                    View Details
                  </SecondaryButton>
                </GlassCard>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Portfolio</h2>
            <div className="space-y-4">
              {profile.portfolio.map(item => (
                <GlassCard key={item.id} className="p-4 bg-gray-800/50 flex justify-between items-center">
                  <p className="font-medium text-white">{item.title}</p>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    <SecondaryButton className="!px-3 !py-1.5">
                      <LinkIcon size={16} />
                    </SecondaryButton>
                  </a>
                </GlassCard>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Certificates</h2>
            <div className="space-y-4">
              {profile.certificates.map(cert => (
                <GlassCard key={cert.id} className="p-4 bg-gray-800/50">
                  <p className="font-medium text-white">{cert.title}</p>
                  <p className="text-sm text-gray-400">from {cert.org}</p>
                </GlassCard>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-8">
          <GlassCard className="p-6 text-center sticky top-24">
            <Lock size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Contact & Socials</h3>
            <p className="text-gray-400">
              To prevent spam, contact information and social links are only revealed
              after a successful match.
            </p>
            <PrimaryButton className="w-full mt-6" onClick={() => setPage('match')}>
              Find a Match
            </PrimaryButton>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

// TOKEN MODAL
const TokenModal = ({ isOpen, onClose, view }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <GlassCard className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold text-white mb-4">Modal: {view}</h2>
      </GlassCard>
    </div>
  );
};

// FOOTER
const Footer = ({ setPage }) => {
  const platformLinks = [
    { name: 'Home', page: 'home' },
    { name: 'Match', page: 'match' },
    { name: 'Categories', page: 'categories' },
    { name: 'Stake', page: 'stake' },
  ];

  return (
    <footer className="border-t border-[#A855F7]/30 mt-24 py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <img src="https://i.postimg.cc/28qRCY2Z/pidd-removebg-preview.png" alt="Piduct" className="h-10 w-auto" />
          <p className="text-gray-400 mt-4 max-w-md">
            The Web3 marketplace where your talent is your currency.
            Barter, build reputation, and earn $PID.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-lg text-white mb-4">Platform</h4>
          <ul className="space-y-3">
            {platformLinks.map(link => (
              <li key={link.page}>
                <button onClick={() => setPage(link.page)} className="text-gray-400 hover:text-white transition-colors">
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-lg text-white mb-4">Community</h4>
          <ul className="space-y-3">
            <li><a href="https://x.com/piduct" className="text-gray-400 hover:text-white flex items-center gap-2"><Twitter size={18} /> X (Twitter)</a></li>
            <li><a href="https://instagram.com/piduct" className="text-gray-400 hover:text-white flex items-center gap-2"><Instagram size={18} /> Instagram</a></li>
            <li><a href="https://youtube.com/@piduct" className="text-gray-400 hover:text-white flex items-center gap-2"><Youtube size={18} /> YouTube</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-[#A855F7]/30 mt-12 pt-8 text-center">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} Piduct. All rights reserved.</p>
      </div>
    </footer>
  );
};

// MAIN APP
function MainApp() {
  const [page, setPage] = useState('home');
  const [modalView, setModalView] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (view) => {
    setModalView(view);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalView('');
  };

  const renderPage = () => {
    if (page.startsWith('category/')) {
      const categoryId = page.split('/')[1];
      return <CategorySkillListPage setPage={setPage} categoryId={categoryId} />;
    }
    if (page.startsWith('user/')) {
      return <PublicProfilePage setPage={setPage} />;
    }

    switch (page) {
      case 'home':
        return <HomePage setPage={setPage} onOpenModal={handleOpenModal} />;
      case 'dashboard':
        return <DashboardPage setPage={setPage} onOpenModal={handleOpenModal} />;
      case 'categories':
        return <CategoriesPage setPage={setPage} />;
      case 'skills':
        return <SkillsPage />;
      case 'requests':
        return <RequestsPage />;
      case 'match':
        return <MatchPage onOpenModal={handleOpenModal} />;
      case 'wallet':
        return <WalletPage />;
      case 'settings':
        return <SettingsPage />;
      case 'stake':
        return <StakeVaultPage />;
      case 'chat':
        return <ChatPage />;
      case 'profile':
        return <PublicProfilePage setPage={setPage} />;
      case 'testnet':
        return <TestnetPage />;
      default:
        return <HomePage setPage={setPage} onOpenModal={handleOpenModal} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% -20%, rgba(168, 85, 247, 0.4), transparent 60%)' }}></div>

      <div className="relative z-10">
        <Navbar setPage={setPage} />
        <main className="max-w-7xl mx-auto px-4 py-12">
          {renderPage()}
        </main>
        <Footer setPage={setPage} />
      </div>

      <TokenModal isOpen={isModalOpen} onClose={handleCloseModal} view={modalView} />
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} chains={[sepolia]}>
          <MainApp />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}