# Mock Mode Development Guide

This guide explains how to use the mock mode feature in the Strive frontend for development and testing purposes.

## 🎭 What is Mock Mode?

Mock mode allows the frontend to run without a backend server by using predefined mock data. This is useful for:
- Frontend development without backend dependencies
- UI/UX testing and prototyping
- Demo purposes
- Testing frontend components in isolation

## 🔧 Enabling Mock Mode

Mock mode is controlled by the `USE_MOCK_DATA` flag in `lib/api.ts`. To enable mock mode:

1. Open `frontend/lib/api.ts`
2. Set `USE_MOCK_DATA` to `true`:
   ```typescript
   const USE_MOCK_DATA = true; // Enable mock mode
   ```

## 📊 Mock Data Structure

The mock data is organized in `lib/mockData.ts` and includes:

### User Data
- `mockUser`: Sample user profile with XP, streak, and title
- `mockUserSkills`: User's skill associations
- `mockStats`: User statistics and achievements

### Content Data
- `mockJobs`: Sample job listings with recommendations
- `mockRoadmaps`: Learning roadmaps with steps
- `mockChallenges`: Coding challenges (daily, weekly, monthly)
- `mockCommunityPosts`: Community posts with interactions
- `mockCVReviews`: CV analysis results

### System Data
- `mockLeaderboard`: Leaderboard entries
- `mockActivities`: User activity history
- `mockSearchResults`: Search results across all content types
- `mockRecentChats`: Recent chat conversations

## 🚀 Using Mock Mode

### Authentication
In mock mode, authentication is simulated:
- Login with any email/password combination
- User data is loaded from `mockUser`
- JWT tokens are simulated

### API Calls
All API calls return mock data:
- Dashboard data loads from `mockApiResponses.dashboard`
- Search results use `mockSearchResults`
- Leaderboard data uses `mockLeaderboard`
- Community posts use `mockCommunityPosts`

### Interactive Features
Mock mode supports interactive features:
- Form submissions show success messages
- Modal interactions work normally
- Navigation between pages functions
- State management works as expected

## 🎨 Customizing Mock Data

### Adding New Mock Data
1. Add your data to `lib/mockData.ts`
2. Update the corresponding API response in `mockApiResponses`
3. Ensure the data structure matches the TypeScript interfaces

### Modifying Existing Data
1. Edit the mock data objects in `lib/mockData.ts`
2. Restart the development server to see changes
3. Test the changes across different components

### Example: Adding a New Job
```typescript
// In lib/mockData.ts
export const mockJobs = [
  // ... existing jobs
  {
    id: 3,
    title: 'Backend Developer',
    company: 'NewTech Inc',
    location: 'Surabaya',
    salary_min: 9000000,
    salary_max: 13000000,
    tags: ['Node.js', 'Python', 'PostgreSQL'],
    description: 'Join our backend team...',
    requirements: ['Node.js experience', 'Database knowledge'],
    is_fulltime: true,
    is_remote: false,
    created_at: new Date().toISOString(),
    isRecommended: false
  }
];
```

## 🔄 Switching Between Mock and Real Data

### Development Workflow
1. **Start with Mock Mode**: Develop UI components with mock data
2. **Test with Real API**: Switch to real API for integration testing
3. **Debug with Mock Mode**: Use mock mode to isolate frontend issues

### Switching Methods
```typescript
// In lib/api.ts
const USE_MOCK_DATA = false; // Use real API
const USE_MOCK_DATA = true;  // Use mock data
```

## 🧪 Testing with Mock Data

### Component Testing
Mock data is perfect for testing React components:
- Consistent data for predictable tests
- No network dependencies
- Fast test execution
- Easy to modify for edge cases

### User Experience Testing
Test different scenarios by modifying mock data:
- Empty states (no jobs, no activities)
- Loading states (simulate delays)
- Error states (invalid data)
- Success states (various data combinations)

## 📱 Mock Mode Features

### Dashboard
- User profile with XP and streak
- Skill management
- Job recommendations
- Activity feed
- Learning progress

### Learning Progress
- Roadmap navigation
- Step completion
- Quiz functionality
- Progress tracking

### Challenges
- Challenge listing
- Code editor interface
- Submission handling
- Results display

### Careers
- Job search and filtering
- Job details
- Recommendations
- Application process

### CV Review
- File upload interface
- Analysis results
- History tracking
- Statistics display

### Community
- Post creation and display
- Interactions (like, comment)
- Recent chats
- User profiles

### Leaderboard
- Multiple leaderboard types
- User ranking
- Tab navigation
- Data display

### Activities
- Activity history
- Filtering options
- Statistics
- Pagination

## 🎯 Best Practices

### Data Consistency
- Keep mock data consistent across related components
- Update related data when modifying one piece
- Use realistic data that matches production scenarios

### Performance
- Mock mode should be fast and responsive
- Avoid large datasets that slow down development
- Use appropriate data sizes for testing

### Documentation
- Document any custom mock data additions
- Keep mock data organized and commented
- Update this guide when adding new features

## 🚨 Limitations

### Real-time Features
- No real-time updates (notifications, live chat)
- No actual file uploads
- No real AI responses

### Data Persistence
- Changes don't persist between sessions
- No actual database operations
- No real user authentication

### External Integrations
- No real API calls
- No actual file processing
- No real AI analysis

## 🔧 Troubleshooting

### Common Issues
1. **Mock data not loading**: Check `USE_MOCK_DATA` flag
2. **Type errors**: Ensure mock data matches TypeScript interfaces
3. **Missing data**: Add missing mock data to `mockData.ts`
4. **Inconsistent state**: Restart development server

### Debug Tips
- Use browser dev tools to inspect API calls
- Check console for mock data loading messages
- Verify mock data structure matches expected format
- Test with different mock data scenarios

## 📚 Related Files

- `lib/api.ts`: API configuration and mock mode toggle
- `lib/mockData.ts`: All mock data definitions
- `types/index.ts`: TypeScript interfaces for data structures
- `components/`: React components that use mock data

## 🎉 Conclusion

Mock mode is a powerful tool for frontend development that allows you to:
- Develop without backend dependencies
- Test UI components in isolation
- Prototype new features quickly
- Demo the application easily

Use mock mode effectively to speed up your development process and create a better user experience!