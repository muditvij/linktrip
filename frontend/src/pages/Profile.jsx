import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Users, Image as ImageIcon, Edit3, X, Camera, Award, Star } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser, setUser } = useContext(AuthContext);

    // Use param ID or fallback to logged in user ID
    const displayUserId = userId || currentUser?.id || currentUser?._id;
    const isOwnProfile = currentUser && (displayUserId === currentUser.id || displayUserId === currentUser._id);

    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isEditing, setIsEditing] = useState(false);
    const [followModal, setFollowModal] = useState(null); // 'followers' or 'following'
    const [formData, setFormData] = useState({ name: '', bio: '', location: '' });
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [coverPicFile, setCoverPicFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState('');

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!displayUserId) return;
            try {
                const [userRes, postsRes] = await Promise.all([
                    axios.get(`/users/${displayUserId}`),
                    axios.get(`/posts/user/${displayUserId}`)
                ]);
                setProfileData(userRes.data);
                setPosts(postsRes.data);
                setFormData({
                    name: userRes.data.name || '',
                    bio: userRes.data.bio || '',
                    location: userRes.data.location || '',
                });
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [displayUserId]);

    const handleFollowToggle = async () => {
        if (!currentUser) return;
        const currentUserId = currentUser.id || currentUser._id;
        // The endpoint now returns populated user objects, so we check _id
        const isFollowing = profileData.followers?.some(f => (f._id || f) === currentUserId);

        try {
            if (isFollowing) {
                await axios.put(`/users/unfollow/${displayUserId}`);
                setProfileData(prev => ({
                    ...prev,
                    followers: prev.followers.filter(f => (f._id || f) !== currentUserId)
                }));
            } else {
                await axios.put(`/users/follow/${displayUserId}`);
                setProfileData(prev => ({
                    ...prev,
                    followers: [...(prev.followers || []), {
                        _id: currentUserId,
                        name: currentUser.name,
                        profilePic: currentUser.profilePic
                    }]
                }));
            }
        } catch (err) {
            console.error('Error toggling follow:', err);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setEditError('');
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('bio', formData.bio);
            submitData.append('location', formData.location);
            if (profilePicFile) submitData.append('profilePic', profilePicFile);
            if (coverPicFile) submitData.append('coverPic', coverPicFile);

            const res = await axios.put('/users/edit', submitData);
            setProfileData(res.data);
            setIsEditing(false);
            setProfilePicFile(null);
            setCoverPicFile(null);

            // Sync global state so the user doesn't have to refresh to see changes (like Navbar pic)
            if (currentUser && setUser) {
                setUser(prev => ({ ...prev, ...res.data }));
            }
        } catch (err) {
            console.error('Failed to update profile:', err);
            setEditError(err.response?.data?.msg || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center text-brand-500 py-20 animate-pulse font-medium">Loading explorer profile...</div>;
    if (!profileData) return <div className="text-center text-red-400 py-20">Profile not found.</div>;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Profile Header */}
            <div className="bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 mb-12">
                <div className="h-64 bg-stone-800 relative overflow-hidden group">
                    {/* Cover Photo */}
                    {profileData.coverPic ? (
                        <img src={profileData.coverPic} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-900/40 via-stone-900 to-stone-950"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent"></div>
                </div>

                <div className="px-8 pb-8 relative -mt-20">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-4">
                        <div className="w-36 h-36 bg-stone-950 rounded-full border-4 border-stone-900 shadow-2xl flex items-center justify-center text-5xl text-stone-600 overflow-hidden shrink-0 relative z-10 group">
                            {profileData.profilePic ? (
                                <img src={profileData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span>🏕️</span>
                            )}
                        </div>

                        {isOwnProfile ? (
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setEditError('');
                                }}
                                className="px-6 py-2.5 bg-stone-800/80 backdrop-blur border border-stone-700 text-white rounded-full font-medium hover:bg-stone-700 transition-colors flex items-center gap-2 shadow-lg w-fit z-10 relative"
                            >
                                <Edit3 className="w-4 h-4" /> Edit Profile
                            </button>
                        ) : currentUser && (
                            <button
                                onClick={handleFollowToggle}
                                className={`px-6 py-2.5 rounded-full font-semibold transition-colors flex items-center gap-2 shadow-lg w-fit z-10 relative ${profileData.followers?.some(f => (f._id || f) === (currentUser.id || currentUser._id))
                                    ? 'bg-stone-800 border border-stone-700 text-stone-300 hover:bg-stone-700 hover:text-white'
                                    : 'bg-brand-600 text-white hover:bg-brand-500 shadow-brand-500/20'
                                    }`}
                            >
                                {profileData.followers?.some(f => (f._id || f) === (currentUser.id || currentUser._id)) ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>

                    <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">{profileData.name}</h1>

                    {profileData.location && (
                        <p className="text-brand-400 flex items-center gap-1.5 mb-4 font-medium">
                            <MapPin className="w-4 h-4" /> {profileData.location}
                        </p>
                    )}

                    {profileData.bio ? (
                        <p className="text-stone-300 mb-8 max-w-2xl leading-relaxed text-lg">
                            {profileData.bio}
                        </p>
                    ) : (
                        <p className="text-stone-500 mb-8 max-w-2xl italic">No bio provided yet. A mysterious traveler...</p>
                    )}

                    {/* Badges Section */}
                    {profileData.badges && profileData.badges.length > 0 && (
                        <div className="mb-8 flex flex-wrap gap-3">
                            {profileData.badges.map((badge, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 bg-gradient-to-r from-brand-900/60 to-emerald-900/60 border border-brand-500/30 text-brand-300 px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                                    <Award className="w-4 h-4 text-brand-400" /> {badge}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-8 border-t border-stone-800/60 pt-6 flex-wrap">
                        <div className="flex flex-col">
                            <span className="font-extrabold text-2xl text-white">{profileData.points || 0}</span>
                            <span className="text-stone-500 text-sm flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                                <Star className="w-4 h-4 text-yellow-500" /> Points
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-2xl text-white">{posts.length}</span>
                            <span className="text-stone-500 text-sm flex items-center gap-1.5 uppercase tracking-wider font-semibold"><ImageIcon className="w-4 h-4" /> Journeys</span>
                        </div>
                        <button onClick={() => setFollowModal('followers')} className="flex flex-col text-left hover:opacity-80 transition-opacity">
                            <span className="font-extrabold text-2xl text-white">{profileData.followers?.length || 0}</span>
                            <span className="text-brand-400 text-sm flex items-center gap-1.5 uppercase tracking-wider font-semibold hover:underline"><Users className="w-4 h-4" /> Followers</span>
                        </button>
                        <button onClick={() => setFollowModal('following')} className="flex flex-col text-left hover:opacity-80 transition-opacity">
                            <span className="font-extrabold text-2xl text-white">{profileData.following?.length || 0}</span>
                            <span className="text-brand-400 text-sm flex items-center gap-1.5 uppercase tracking-wider font-semibold hover:underline"><Users className="w-4 h-4" /> Following</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <h2 className="text-2xl font-bold text-white mb-6 px-2 flex items-center gap-2">
                <Camera className="w-6 h-6 text-brand-500" /> Travel Log
            </h2>

            {posts.length === 0 ? (
                <div className="text-center py-12 bg-stone-900/50 rounded-3xl border border-stone-800/50">
                    <p className="text-stone-500 text-lg">No journeys recorded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <div key={post._id} className="aspect-square bg-stone-900 border border-stone-800 rounded-2xl relative overflow-hidden group shadow-lg">
                            {post.image ? (
                                <img src={post.image} alt="Post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-700 bg-stone-950 p-4 text-center">
                                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-xs text-stone-500 line-clamp-3">{post.caption}</p>
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-stone-950/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-white font-medium backdrop-blur-sm p-4 text-center">
                                <p className="text-sm text-stone-300 line-clamp-2 mb-2">"{post.caption}"</p>
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1.5 text-brand-400">❤️ {post.likes?.length || 0}</span>
                                    <span className="flex items-center gap-1.5 text-brand-400">💬 {post.comments?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-stone-900 rounded-3xl border border-stone-800 w-full max-w-lg overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors bg-stone-800 p-2 rounded-full z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

                            {editError && (
                                <div className="bg-red-950/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                                    {editError}
                                </div>
                            )}

                            <form className="space-y-5" onSubmit={handleSaveProfile}>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Profile Picture</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setProfilePicFile(e.target.files[0])}
                                        className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 text-stone-400 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all
                                        file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Cover Picture</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setCoverPicFile(e.target.files[0])}
                                        className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 text-stone-400 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all
                                        file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-stone-700 file:text-white hover:file:bg-stone-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-stone-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-stone-600"
                                        placeholder="e.g. Tokyo, Japan"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Bio</label>
                                    <textarea
                                        rows="3"
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none placeholder-stone-600"
                                        placeholder="Share your travel philosophy..."
                                    ></textarea>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Follow Modal */}
            {followModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-stone-900 rounded-3xl border border-stone-800 w-full max-w-sm overflow-hidden shadow-2xl relative">
                        <div className="flex items-center justify-between p-6 border-b border-stone-800">
                            <h2 className="text-xl font-bold text-white capitalize">{followModal}</h2>
                            <button
                                onClick={() => setFollowModal(null)}
                                className="text-stone-500 hover:text-white transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-2 max-h-96 overflow-y-auto custom-scrollbar">
                            {profileData[followModal]?.length === 0 ? (
                                <p className="text-center text-stone-500 py-8 italic">No {followModal} to display.</p>
                            ) : (
                                profileData[followModal]?.map((person, i) => (
                                    <a
                                        key={person._id || i}
                                        href={`/profile/${person._id}`}
                                        className="flex items-center gap-4 p-4 hover:bg-stone-800/50 rounded-2xl transition-colors group"
                                    >
                                        <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-stone-700">
                                            {person.profilePic ? (
                                                <img src={person.profilePic} alt={person.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-lg">👤</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white group-hover:text-brand-400 transition-colors">{person.name}</p>
                                        </div>
                                    </a>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
