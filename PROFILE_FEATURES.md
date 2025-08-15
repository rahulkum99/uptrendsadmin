# Profile Management Features

## Overview
The Profile Management system allows users to create and update their profile information using the API endpoints.

## Features

### ✅ Profile Form
- **Personal Information:**
  - First Name (required)
  - Last Name (required)
  - Email (required)
  - Phone Number (optional)

- **Additional Information:**
  - Date of Birth
  - Gender (Male/Female/Other)
  - Profile Picture URL
  - Bio/About Me

### 🔄 API Integration

**GET Profile Data:**
- Endpoint: `{{baseUrl}}auth/profile/`
- Method: `GET`
- Headers: `Authorization: Bearer {access_token}`
- Response: Returns current profile data

**Update Profile:**
- Endpoint: `{{baseUrl}}auth/profile/`
- Method: `PUT`
- Headers: `Authorization: Bearer {access_token}`
- Body: Profile data in JSON format

### 📱 User Interface

**Profile Screen Features:**
- Clean, responsive form layout
- Real-time form validation
- Profile picture preview
- Success/error message alerts
- Loading states during API calls
- Current profile information display

**Navigation:**
- Accessible via Sidebar menu (Profile)
- Accessible via Header dropdown (Profile)
- Protected route (requires authentication)

### 🎨 Form Fields

**Required Fields:**
- First Name
- Last Name
- Email

**Optional Fields:**
- Phone Number
- Date of Birth
- Gender
- Profile Picture URL
- Bio

### 📊 Data Structure

**Request Body:**
```json
{
  "bio": "this is bio",
  "profile_picture": "",
  "date_of_birth": "1995-01-10",
  "gender": "M",
  "first_name": "rahul",
  "last_name": "kumar",
  "user_email": "krabhinav79@gmail.com",
  "user_phone_number": ""
}
```

**Response Structure:**
```json
{
  "user_email": "salon4mein@gmail.com",
  "user_phone_number": "",
  "first_name": "rahul",
  "last_name": "kumar",
  "bio": "this is bio",
  "profile_picture": null,
  "date_of_birth": "1995-01-10",
  "gender": "M",
  "email": null,
  "phone_number": null,
  "is_verified": false
}
```

### 🔐 Security
- Protected route requiring authentication
- Token-based API authorization
- Form validation and sanitization
- Error handling for network issues

### 🚀 Usage
1. Navigate to Profile page via sidebar or header
2. Fill in the required information
3. Add optional details as needed
4. Click "Create Profile" or "Update Profile"
5. View success message and current profile data

### 📝 Notes
- Profile data is automatically loaded when the page loads
- Form shows existing data if profile already exists
- Profile picture preview shows when URL is provided
- All API calls include proper error handling
