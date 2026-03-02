import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Image as ImageIcon, X } from 'lucide-react';
import axios from 'axios';

const CreatePost = () => {
    const [formData, setFormData] = useState({ caption: '', location: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // Reverse geocoding using a free nominatim API
                    const { latitude, longitude } = position.coords;
                    const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    if (res.data && res.data.address) {
                        const city = res.data.address.city || res.data.address.town || res.data.address.village;
                        const country = res.data.address.country;
                        setFormData(prev => ({ ...prev, location: city ? `${city}, ${country}` : country }));
                    } else {
                        setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
                    }
                } catch (err) {
                    // Fallback to coordinates if API fails
                    setFormData(prev => ({ ...prev, location: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}` }));
                } finally {
                    setFetchingLocation(false);
                }
            },
            () => {
                setError('Unable to retrieve your location');
                setFetchingLocation(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('caption', formData.caption);
        data.append('location', formData.location);
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            await axios.post('/posts', data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create post. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-12 mb-20 relative px-4 sm:px-0">
            {/* Background Accents */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="bg-stone-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-stone-800/60 p-8 sm:p-10 relative z-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-400 mb-8 flex items-center gap-4 tracking-tight">
                    <span className="p-3 bg-stone-800 rounded-2xl shadow-inner border border-stone-700/50 block"><Camera className="w-8 h-8 text-brand-400" /></span>
                    Capture the Journey
                </h1>

                {error && <div className="bg-red-950/50 border border-red-500/50 text-red-200 px-5 py-3 rounded-xl mb-8 text-sm font-medium flex items-center gap-2"><X className="w-4 h-4" />{error}</div>}

                <form className="space-y-8" onSubmit={handleSubmit}>
                    {/* Image File Input */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="border border-stone-700/50 rounded-2xl p-8 sm:p-12 text-center hover:bg-stone-800/30 transition-all bg-stone-900/90 relative overflow-hidden">
                            {imagePreview ? (
                                <div className="relative inline-block w-full">
                                    <img src={imagePreview} alt="Preview" className="w-full max-h-[28rem] rounded-xl object-contain shadow-2xl" />
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute -top-4 -right-4 bg-stone-800 text-stone-300 hover:text-white rounded-full p-2.5 shadow-xl border border-stone-700 hover:bg-red-500 hover:border-red-400 transition-all z-20"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="w-20 h-20 bg-stone-950 rounded-full flex items-center justify-center mb-6 shadow-inner border border-stone-800 group-hover:scale-110 transition-transform duration-500">
                                        <ImageIcon className="w-10 h-10 text-brand-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Upload a Photo</h3>
                                    <p className="text-stone-400 mb-8 font-medium max-w-xs mx-auto text-sm leading-relaxed">High quality images from your travels make the best stories.</p>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                        />
                                        <div className="px-8 py-3 bg-stone-800 text-white rounded-full font-semibold border border-stone-700 shadow-lg group-hover:bg-stone-700 transition-colors pointer-events-none">
                                            Choose File
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6 bg-stone-950/30 p-6 sm:p-8 rounded-2xl border border-stone-800/40">
                        <div>
                            <label className="block text-sm font-bold text-stone-300 mb-2 tracking-wide uppercase">The Story</label>
                            <textarea
                                rows="3"
                                required
                                value={formData.caption}
                                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                className="w-full px-5 py-4 bg-stone-900 border border-stone-800 text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-stone-600 resize-none text-lg"
                                placeholder="Describe this moment..."
                            ></textarea>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-stone-300 flex items-center gap-2 tracking-wide uppercase">
                                    <MapPin className="w-4 h-4 text-emerald-500" /> Location
                                </label>
                                <button
                                    type="button"
                                    onClick={detectLocation}
                                    disabled={fetchingLocation}
                                    className="text-xs bg-brand-900/30 hover:bg-brand-900/50 text-brand-300 px-4 py-1.5 rounded-full transition-colors font-semibold border border-brand-500/30 flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {fetchingLocation ? 'Locating...' : 'Auto Detect'}
                                </button>
                            </div>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-5 py-4 bg-stone-900 border border-stone-800 text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-stone-600 text-lg"
                                placeholder="Where was this taken?"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-8 py-3.5 text-stone-400 font-bold hover:text-white transition-colors bg-stone-900 rounded-xl border border-stone-800 hover:bg-stone-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (!imageFile && !formData.caption)}
                            className="px-10 py-3.5 bg-gradient-to-r from-brand-600 to-emerald-600 text-white rounded-xl font-bold hover:from-brand-500 hover:to-emerald-500 transition-all shadow-xl shadow-brand-500/20 disabled:opacity-50 disabled:grayscale transform hover:-translate-y-0.5"
                        >
                            {loading ? 'Publishing...' : 'Publish Journey'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
