import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, FileText, LogOut, Plus, Search } from 'lucide-react';
import api from '../api/axios';

const Dashboard = ({ user, onLogout }) => {
    const [secrets, setSecrets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSecret, setSelectedSecret] = useState(null);

    useEffect(() => {
        fetchSecrets();
    }, []);

    const fetchSecrets = async () => {
        try {
            const res = await api.get('/secrets');
            setSecrets(res.data);
        } catch (err) {
            console.error('Failed to fetch secrets', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#050505] text-white overflow-hidden">
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-20 lg:w-64 glass-panel border-r border-white/10 flex flex-col items-center lg:items-start py-8 lg:px-6 transition-all z-20"
            >
                <div className="flex items-center gap-3 mb-12 text-neonBlue">
                    <Shield size={32} className="animate-pulse" />
                    <span className="hidden lg:block font-mono text-xl font-bold tracking-widest">VAULT</span>
                </div>

                <nav className="flex-1 w-full flex flex-col gap-4">
                    <NavItem icon={<FileText />} label="Secrets" active />
                    <NavItem icon={<Key />} label="Keys" />
                    <NavItem icon={<Shield />} label="Security" />
                </nav>

                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors mt-auto"
                >
                    <LogOut size={20} />
                    <span className="hidden lg:block">Disconnect</span>
                </button>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto relative">
                {/* Background Grid/Effects */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neonBlue/10 rounded-full blur-[100px] pointer-events-none" />

                <header className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Secure Storage</h1>
                        <p className="text-gray-400 text-sm font-mono">USER: {user?.name || 'UNKNOWN'}</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-2 glass-panel rounded-full hover:bg-white/10 transition">
                            <Search size={20} />
                        </button>
                        <button className="p-2 bg-neonBlue text-black rounded-full hover:bg-neonBlue/80 transition shadow-[0_0_15px_#00f3ff]">
                            <Plus size={24} />
                        </button>
                    </div>
                </header>

                {/* Secrets Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-neonBlue border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                    >
                        {secrets.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 py-20 border border-dashed border-white/10 rounded-2xl">
                                No secrets found in the vault.
                            </div>
                        ) : secrets.map((secret) => (
                            <SecretCard key={secret.id} secret={secret} onClick={() => setSelectedSecret(secret)} />
                        ))}

                        {/* Fake entries for visual demo if empty */}
                        {secrets.length === 0 && (
                            <>
                                <SecretCard secret={{ id: 'demo1', title: 'Launch Codes', last_accessed: new Date().toISOString(), type: 'Enigma' }} onClick={() => { }} />
                                <SecretCard secret={{ id: 'demo2', title: 'Neural Net Config', last_accessed: new Date().toISOString(), type: 'System' }} onClick={() => { }} />
                            </>
                        )}
                    </motion.div>
                )}
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, active }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-neonBlue/10 text-neonBlue border border-neonBlue/20' : 'hover:bg-white/5 text-gray-400'}`}>
        {icon}
        <span className="hidden lg:block font-medium">{label}</span>
    </div>
);

const SecretCard = ({ secret, onClick }) => (
    <motion.div
        variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="glass-panel p-6 rounded-2xl cursor-pointer hover:border-neonBlue/50 transition-all group"
        onClick={onClick}
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-lg group-hover:bg-neonBlue/20 transition-colors">
                <FileText className="text-neonBlue" size={24} />
            </div>
            <span className="text-xs font-mono text-gray-500 px-2 py-1 border border-white/10 rounded">{secret.type || 'DATA'}</span>
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-neonBlue transition-colors">{secret.title}</h3>
        <p className="text-sm text-gray-400 font-mono">LAST ACCESS: {new Date(secret.last_accessed).toLocaleDateString()}</p>
    </motion.div>
);

export default Dashboard;
