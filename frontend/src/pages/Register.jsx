import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        const success = await register(formData);
        if (success) {
            navigate('/');
        } else {
            setError('Registration failed. Email might be in use.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 bg-stone-900 p-8 rounded-2xl shadow-xl border border-stone-800">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Join Linktrip</h1>
                <p className="text-stone-400">Create an account to share your adventures</p>
            </div>

            {error && <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-4 text-sm font-medium">{error}</div>}

            <form className="space-y-4" onSubmit={handleRegister}>
                <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-stone-950 border border-stone-800 text-white rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-stone-600"
                        placeholder="Jane Doe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Email</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 bg-stone-950 border border-stone-800 text-white rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-stone-600"
                        placeholder="explorer@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Password</label>
                    <input
                        type="password"
                        required
                        minLength="6"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 bg-stone-950 border border-stone-800 text-white rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-stone-600"
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" className="w-full py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-500 transition-colors mt-6 shadow-lg shadow-brand-500/20">
                    Create Account
                </button>
            </form>

            <p className="text-center mt-6 text-stone-400">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-500 font-medium hover:text-brand-400">
                    Sign in
                </Link>
            </p>
        </div>
    );
};

export default Register;
