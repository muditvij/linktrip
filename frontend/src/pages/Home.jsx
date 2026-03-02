import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapPin, MessageSquare, Heart, Send } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [activeCommentPost, setActiveCommentPost] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [feedType, setFeedType] = useState('all');

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const endpoint = feedType === 'following' && user ? '/posts/feed' : '/posts';
                const res = await axios.get(endpoint);
                setPosts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [feedType, user]);

    const handleLike = async (postId) => {
        if (!user) return alert('Please login to like posts');
        try {
            const res = await axios.put(`/posts/like/${postId}`);
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, likes: res.data } : post
            ));
        } catch (err) {
            console.error(err.response?.data?.msg || 'Error liking post');
        }
    };

    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        if (!user) return alert('Please login to comment');
        if (!commentText.trim()) return;

        try {
            const res = await axios.post(`/posts/comment/${postId}`, { text: commentText });
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, comments: res.data } : post
            ));
            setCommentText('');
            setActiveCommentPost(null);
        } catch (err) {
            console.error('Error adding comment');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center py-12 mb-8 border-b border-stone-800 pb-16">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-400 mb-6 tracking-tight">Record your journey now</h1>
                <p className="text-lg text-stone-400 max-w-xl mx-auto mb-10">The right hand for travellers. Share your experiences, find inspiration, and connect with explorers worldwide.</p>

                {user && (
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setFeedType('all')}
                            className={`px-8 py-2.5 rounded-full font-bold transition-all ${feedType === 'all' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'}`}
                        >
                            Explore
                        </button>
                        <button
                            onClick={() => setFeedType('following')}
                            className={`px-8 py-2.5 rounded-full font-bold transition-all ${feedType === 'following' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'}`}
                        >
                            Following
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                {loading ? (
                    <div className="text-center text-brand-500 py-12 animate-pulse font-medium">Loading the latest adventures...</div>
                ) : posts.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center hover-glow relative overflow-hidden group border border-stone-800/40">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/20 to-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        <h2 className="text-2xl font-bold mb-4 text-white relative z-10">No stories yet</h2>
                        <p className="text-stone-400 mb-6 relative z-10">Be the first to share an amazing travel experience with the world.</p>
                        <Link to="/create-post" className="inline-block px-8 py-3 bg-brand-600 text-white rounded-full font-medium hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/30 hover:-translate-y-1 relative z-10">
                            Share a Post
                        </Link>
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post._id} className="glass-card rounded-3xl overflow-hidden hover-glow relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10 hidden sm:block"></div>

                            <div className="p-5 flex items-center gap-4 border-b border-stone-800/40 relative z-20 bg-stone-900/20">
                                <Link to={`/profile/${post.user?._id}`} className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center text-stone-500 border-2 border-transparent group-hover:border-brand-500/50 transition-colors overflow-hidden shrink-0">
                                    {post.user?.profilePic ? <img src={post.user.profilePic} className="w-full h-full object-cover" /> : '👤'}
                                </Link>
                                <div>
                                    <Link to={`/profile/${post.user?._id}`} className="font-bold text-white hover:text-brand-400 transition-colors">
                                        {post.user?.name || 'Unknown Explorer'}
                                    </Link>
                                    {post.location && (
                                        <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-3 h-3 text-brand-500" /> {post.location}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Optional Post Image - Placeholder styled for travel vibe */}
                            {post.image ? (
                                <div className="w-full relative overflow-hidden bg-stone-950 group/image">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900/10 to-stone-950/80 pointer-events-none z-10 transition-opacity duration-700 opacity-0 group-hover/image:opacity-100"></div>
                                    <img src={post.image} alt="Post" className="w-full h-auto max-h-[32rem] object-cover transition-transform duration-[2000ms] group-hover/image:scale-105" />
                                </div>
                            ) : (
                                <div className="w-full h-56 bg-gradient-to-br from-stone-900 via-stone-950 to-brand-950/20 flex flex-col items-center justify-center border-b border-stone-800/60 relative overflow-hidden group/empty">
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-50 group-hover/empty:opacity-100 transition-opacity duration-1000"></div>
                                    <div className="text-center relative z-10 transform transition-transform duration-700 group-hover/empty:scale-110">
                                        <span className="text-5xl block mb-3 drop-shadow-2xl">🌍</span>
                                        <span className="text-stone-500 text-xs font-bold tracking-[0.3em] uppercase bg-stone-950/50 px-4 py-1.5 rounded-full border border-stone-800/50 backdrop-blur-sm">Travel Log</span>
                                    </div>
                                </div>
                            )}

                            <div className="p-6">
                                <div className="flex items-center gap-6 mb-5">
                                    <button
                                        onClick={() => handleLike(post._id)}
                                        className={`flex items-center gap-2 transition-colors group ${post.likes?.includes(user?._id || user?.id) ? 'text-red-500' : 'text-stone-400 hover:text-red-400'}`}
                                    >
                                        <Heart className={`w-6 h-6 group-hover:scale-110 transition-transform ${post.likes?.includes(user?._id || user?.id) ? 'fill-current' : ''}`} />
                                        <span className="font-medium text-sm">{post.likes?.length || 0}</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)}
                                        className="flex items-center gap-2 text-stone-400 hover:text-brand-400 transition-colors group"
                                    >
                                        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        <span className="font-medium text-sm">{post.comments?.length || 0}</span>
                                    </button>
                                </div>
                                <p className="text-stone-300 leading-relaxed mb-4">
                                    <span className="font-bold text-white mr-2">{post.user?.name || 'Explorer'}</span>
                                    {post.caption}
                                </p>

                                {/* Comments Section */}
                                {activeCommentPost === post._id && (
                                    <div className="mt-4 pt-4 border-t border-stone-800">
                                        <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                            {post.comments?.length > 0 ? (
                                                post.comments.map((comment, i) => (
                                                    <div key={i} className="bg-stone-950/50 p-3 rounded-lg text-sm">
                                                        <span className="font-bold text-brand-400 block mb-1">User</span>
                                                        <p className="text-stone-300">{comment.text}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-stone-500 text-sm italic">No comments yet. Be the first!</p>
                                            )}
                                        </div>
                                        {user && (
                                            <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    placeholder="Add a comment..."
                                                    className="flex-1 bg-stone-950 border border-stone-800 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                                                />
                                                <button type="submit" disabled={!commentText.trim()} className="bg-brand-600 text-white p-2 text-sm rounded-full hover:bg-brand-500 transition-colors disabled:opacity-50">
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Home;
