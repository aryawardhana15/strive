# 🧪 Testing Instructions - Frontend Mock Mode

## 🚀 Quick Start

1. **Frontend sudah running di:** `http://localhost:3001`

2. **Test Login Page:** `http://localhost:3001/test-login`

3. **Redirect Test:** `http://localhost:3001/redirect-test`

## 🔧 Cara Test Login

### Option 1: Test Login Page (Recommended)
- Buka: `http://localhost:3001/test-login`
- Masukkan email/password apapun
- Klik "Login" atau "Quick Fill Test Data"
- Akan redirect ke dashboard dengan user: Arya Pratama

### Option 2: Original Login Page
- Buka: `http://localhost:3001/auth/login`
- Masukkan email/password apapun
- Klik "Masuk"

## 📊 Mock Data yang Tersedia

### User Login
- **Name:** Arya Pratama
- **Email:** arya@example.com
- **Title:** Intermediate
- **XP:** 2450
- **Streak:** 7 hari
- **Study Time:** 32 jam

### Features Available
- ✅ Dashboard dengan profil dan statistik
- ✅ Leaderboard (Global, Streaks, Challenges, Community)
- ✅ Skills Management
- ✅ Activities History
- ✅ Community Posts
- ✅ Job Recommendations

## 🐛 Debug Information

### Console Logs
Buka browser console (F12) untuk melihat:
- `🔧 Mock login called with:` - Data login yang dikirim
- `✅ Mock login successful` - Login berhasil
- `📦 Auth API response:` - Response dari API

### Common Issues
1. **Login tidak redirect:** Check console untuk error
2. **Data tidak muncul:** Pastikan mock data ter-load
3. **Styling rusak:** Check Tailwind CSS classes

## 🔄 Switch to Real Backend

Ketika backend baru siap:
1. Set `USE_MOCK_DATA = false` di `frontend/lib/api.ts`
2. Pastikan backend running di `localhost:5000`
3. Test dengan user real dari database

## 📱 Test URLs

- **Test Login:** http://localhost:3001/test-login
- **Original Login:** http://localhost:3001/auth/login
- **Dashboard:** http://localhost:3001/
- **Leaderboard:** http://localhost:3001/leaderboard
- **Community:** http://localhost:3001/community
- **Challenges:** http://localhost:3001/challenges

## 🎯 Expected Behavior

1. **Login:** Any email/password → Success → Redirect to dashboard
2. **Dashboard:** Shows Arya Pratama's profile and stats
3. **Navigation:** All sidebar links work
4. **Data:** Mock data displays correctly
5. **No Backend:** No API calls to backend server

## 🚨 Troubleshooting

### If Login Fails:
1. Check browser console for errors
2. Verify `USE_MOCK_DATA = true` in api.ts
3. Clear localStorage and try again
4. Check network tab for failed requests

### If Data Not Loading:
1. Check mock data in `frontend/lib/mockData.ts`
2. Verify API responses in console
3. Check component props and state

### If Styling Issues:
1. Check Tailwind CSS classes
2. Verify CSS imports in globals.css
3. Check for missing dependencies

