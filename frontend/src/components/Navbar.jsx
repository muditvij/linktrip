import { Link, useNavigate } from 'react-router-dom';
import { Camera, Compass, User as UserIcon, LogOut, Star } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-stone-950/60 backdrop-blur-2xl sticky top-0 z-50 border-b border-stone-800/40 shadow-sm shadow-black/20">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <Compass className="w-8 h-8 text-brand-500" />
                        <span className="font-bold text-xl tracking-tight text-white">Linktrip</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Link to="/create-post" className="text-stone-400 hover:text-brand-500 transition-colors" title="Create Post">
                                    <Camera className="w-6 h-6" />
                                </Link>
                                <Link to={`/profile/${user.id || user._id}`} className="text-stone-400 hover:text-brand-500 transition-colors" title="Profile">
                                    <UserIcon className="w-6 h-6" />
                                </Link>
                                <div className="h-6 w-px bg-stone-700 mx-2"></div>
                                <div className="flex items-center gap-3">
                                    {user.points !== undefined && (
                                        <div className="hidden sm:flex items-center gap-1.5 bg-brand-950/50 border border-brand-800/50 rounded-full px-2.5 py-1" title="Your Explorer Points">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            <span className="text-sm font-bold text-brand-300">{user.points}</span>
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-stone-300 hidden sm:block">
                                        Hi, {user.name?.split(' ')[0]}
                                    </span>
                                    <button onClick={handleLogout} className="text-stone-400 hover:text-red-400 transition-colors" title="Logout">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="px-5 py-2 bg-brand-600 text-white rounded-full text-sm font-medium hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
