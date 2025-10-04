'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, CommunityPost, Comment } from '@/types';
import { auth } from '@/lib/auth';
import { communityAPI } from '@/lib/api';
import { MessageCircle, Heart, Share, MoreHorizontal, Send, Image, Code, Smile, Bookmark } from 'lucide-react';

export default function CommunityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({
    content: '',
    image: null as File | null
  });
  const [showNewPost, setShowNewPost] = useState(false);
  const [posting, setPosting] = useState(false);
  const [recentChats, setRecentChats] = useState<any[]>([]);
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
        const [postsResponse, chatsResponse] = await Promise.all([
          communityAPI.getPosts(),
          communityAPI.getRecentChats()
        ]);

        setPosts(postsResponse.data.data || []);
        setRecentChats(chatsResponse.data.data || []);

      } catch (error) {
        console.error('Error initializing community page:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeCommunity();
  }, [router]);

  const handleCreatePost = async () => {
    if (!user || !newPost.content.trim()) return;

    setPosting(true);
    try {
      let imageUrl = null;
      
      // Upload image first if exists
      if (newPost.image) {
        const formData = new FormData();
        formData.append('image', newPost.image);
        const uploadResponse = await communityAPI.uploadImage(newPost.image);
        imageUrl = uploadResponse.data.data.image_url;
      }

      // Create post
      const response = await communityAPI.createPost(newPost.content, imageUrl);
      const createdPost = response.data.data;

      // Add to the beginning of the list
      setPosts(prev => [createdPost, ...prev]);
      
      // Reset form
      setNewPost({ content: '', image: null });
      setShowNewPost(false);

    } catch (error) {
      console.error('Error creating post:', error);
      alert('Gagal membuat post. Silakan coba lagi.');
    } finally {
      setPosting(false);
    }
  };

  const handleLikePost = async (postId: number) => {
    if (!user) return;

    try {
      await communityAPI.likePost(postId);
      
      // Update the post in the list
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1,
                is_liked: !post.is_liked
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPost(prev => ({ ...prev, image: file }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    if (diffInHours < 48) return 'Kemarin';
    return date.toLocaleDateString('id-ID');
  };

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Komunitas</h1>
          <p className="text-gray-600 mt-1">
            Berbagi pengalaman dan belajar bersama
          </p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="btn btn-primary"
        >
          Buat Post
        </button>
      </div>

      {/* Create New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Buat Post Baru</h2>
              <button
                onClick={() => setShowNewPost(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Apa yang ingin kamu bagikan hari ini?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={4}
              />

              {newPost.image && (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(newPost.image)}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setNewPost(prev => ({ ...prev, image: null }))}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                    <Image className="w-4 h-4" />
                    <span>Gambar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <button className="flex items-center space-x-2 text-sm text-gray-600">
                    <Code className="w-4 h-4" />
                    <span>Code</span>
                  </button>
                  <button className="flex items-center space-x-2 text-sm text-gray-600">
                    <Smile className="w-4 h-4" />
                    <span>Emoji</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowNewPost(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.content.trim() || posting}
                    className="btn btn-primary"
                  >
                    {posting ? 'Memposting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="card">
            {/* Post Header */}
            <div className="flex items-start space-x-3 mb-4">
              <img
                src={post.user.avatar_url || '/default-avatar.png'}
                alt={post.user.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{formatDate(post.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600">@{post.user.name.toLowerCase().replace(/\s+/g, '')}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="Post image"
                  className="mt-3 w-full rounded-lg"
                />
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center space-x-2 ${
                    post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{post.likes_count}</span>
                </button>

                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.comments_count}</span>
                </button>

                <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500">
                  <Share className="w-5 h-5" />
                  <span className="text-sm">Share</span>
                </button>
              </div>

              <button className="flex items-center space-x-2 text-gray-500 hover:text-yellow-500">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>

            {/* Comments Section */}
            {post.comments && post.comments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="space-y-3">
                  {post.comments.slice(0, 2).map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <img
                        src={comment.user.avatar_url || '/default-avatar.png'}
                        alt={comment.user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 text-sm">{comment.user.name}</h4>
                          <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {post.comments.length > 2 && (
                    <button className="text-sm text-primary-600 hover:text-primary-700">
                      Lihat {post.comments.length - 2} komentar lainnya
                    </button>
                  )}
                </div>

                {/* Add Comment */}
                <div className="mt-3 flex items-center space-x-3">
                  <img
                    src={user.avatar_url || '/default-avatar.png'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Tulis komentar..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button className="p-2 text-primary-600 hover:text-primary-700">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Chats Widget */}
      {recentChats.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Chat Terbaru</h3>
          <div className="space-y-3">
            {recentChats.map((chat) => (
              <div key={chat.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <img
                  src={chat.user.avatar_url || '/default-avatar.png'}
                  alt={chat.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{chat.user.name}</h4>
                  <p className="text-xs text-gray-600 truncate">{chat.last_message}</p>
                </div>
                <span className="text-xs text-gray-500">{formatDate(chat.updated_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="card">
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada post
            </h3>
            <p className="text-gray-600 mb-4">
              Jadilah yang pertama berbagi pengalaman belajar!
            </p>
            <button
              onClick={() => setShowNewPost(true)}
              className="btn btn-primary"
            >
              Buat Post Pertama
            </button>
          </div>
        </div>
      )}
    </div>
  );
}