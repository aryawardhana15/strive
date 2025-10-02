'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, CommunityPost, PostComment } from '@/types';
import { auth } from '@/lib/auth';
import { usersAPI, communityAPI } from '@/lib/api';
import { Search, Camera, Video, Code, ThumbsUp, ThumbsDown, MessageCircle, Bookmark, MoreHorizontal, Send } from 'lucide-react';

export default function CommunityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeCommunity = async () => {
      try {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        setUser(currentUser);

        // Fetch posts and recent chats
        const [postsResponse] = await Promise.all([
          communityAPI.getPosts({ limit: 20 })
        ]);

        setPosts(postsResponse.data.data || []);
        setRecentChats([]);

      } catch (error) {
        console.error('Error initializing community:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeCommunity();
  }, [router]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || posting) return;

    setPosting(true);
    try {
      const response = await communityAPI.createPost(newPostContent);
      const newPost = response.data.data;
      
      // Add to posts list
      setPosts(prev => [newPost, ...prev]);
      setNewPostContent('');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Gagal membuat post. Silakan coba lagi.');
    } finally {
      setPosting(false);
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      await communityAPI.likePost(postId);
      
      // Update posts list
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours} j`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} h`;
    return date.toLocaleDateString('id-ID');
  };

  const PostCard = ({ post }: { post: CommunityPost }) => (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {post.user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{post.user?.name || 'Anonymous'}</div>
            <div className="text-sm text-gray-500">{formatTimeAgo(post.created_at)}</div>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-full">
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-gray-900">{post.content}</p>
        {post.image_url && (
          <div className="mt-3">
            <img 
              src={post.image_url} 
              alt="Post image" 
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => handleLikePost(post.id)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ThumbsUp className="w-5 h-5" />
          <span className="text-sm font-medium">{post.likes_count}</span>
        </button>
        
        <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
          <ThumbsDown className="w-5 h-5" />
        </button>
        
        <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">1</span>
        </button>
        
        <button className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 transition-colors">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const ChatSnippet = ({ chat }: { chat: any }) => (
    <div className="card">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-gray-600">
            {chat.user?.name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 text-sm mb-1">
            {chat.user?.name || 'Anonymous'}
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">
            {chat.content}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            Komunitas
          </h1>
          <p className="text-gray-600 mt-2">
            Berbagi pengalaman, bertanya, dan belajar bersama komunitas Strive.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari Topik"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Create Post */}
          <div className="card">
            <div className="mb-4">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Apa yang ingin kamu bagikan hari ini?"
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm font-medium">Foto</span>
                </button>
                
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                  <Video className="w-4 h-4" />
                  <span className="text-sm font-medium">Video</span>
                </button>
                
                <button className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
                  <Code className="w-4 h-4" />
                  <span className="text-sm font-medium">Kode</span>
                </button>
              </div>
              
              <button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() || posting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                <span className="text-sm font-medium">Post</span>
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="card text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada post</h3>
                <p className="text-gray-600">Jadilah yang pertama berbagi di komunitas!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Chats */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Obrolan Terbaru
            </h2>
            
            <div className="space-y-3">
              {recentChats.length > 0 ? (
                recentChats.map((chat, index) => (
                  <ChatSnippet key={index} chat={chat} />
                ))
              ) : (
                <div className="card text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">Belum ada obrolan</p>
                </div>
              )}
            </div>
          </div>

          {/* Community Stats */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Statistik Komunitas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Post</span>
                <span className="font-semibold">{posts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Anggota Aktif</span>
                <span className="font-semibold">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Post Hari Ini</span>
                <span className="font-semibold">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <span className="text-sm font-medium">Tanya StriveAI ✨</span>
        </button>
      </div>
    </div>
  );
}
