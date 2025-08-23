# Partner Review Implementation

## Overview
A new page for reviewing onboarded partners has been created with RTK Query integration and modern design.

## Files Created/Modified

### 1. **New RTK Query API Slice**
- **File**: `src/redux/api/partnerReviewApi.js`
- **Endpoint**: `adminuser/patner-in-review/`
- **Features**:
  - Get all partners in review with pagination
  - Get single partner review by UID
  - Approve partner (verify and activate)
  - Reject partner (unverify and deactivate)
  - Delete partner review
  - Automatic token refresh and error handling

### 2. **Redux Store Updates**
- **File**: `src/redux/store.jsx`
- **Changes**:
  - Added `partnerReviewApi` import
  - Added `partnerReviewApi.reducer` to store
  - Added `partnerReviewApi.middleware` to middleware chain

### 3. **New Screen Component**
- **File**: `src/screen/PartnerReviewScreen.jsx`
- **Features**:
  - Modern design matching other screens
  - 6-column statistics cards
  - Advanced filtering and search
  - Pagination support
  - Partner approval/rejection actions
  - Detailed modal view
  - Responsive design

## API Response Structure
```json
{
  "count": 1,
  "total_pages": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "uid": "c8d40474-15fb-4b62-a269-70c8107e8fe3",
      "shop": "aaeb2172-852f-4a58-833c-5f51287e4353",
      "service_name": "Hair Studio",
      "service_type": [...],
      "service_type_display": [...],
      "contact_number": "9865656234",
      "email": "hairstudio@gmail.com",
      "address": "09, Lekha Nagar, Khagaul, India",
      "address2": "VILL NIRPURA PO NISARPURA",
      "landmark": "cxzczc",
      "city": "Patna",
      "state": "Bihar",
      "pincode": 801505,
      "established_year": "2000",
      "description": "description",
      "is_active": true,
      "is_verified": false,
      "latitude": "25.621299",
      "longitude": "85.147648"
    }
  ]
}
```

## Key Features

### **1. Statistics Dashboard**
- Total Pending Reviews
- Verified Partners
- Unverified Partners
- Active Partners
- Partners with Contact Info
- Partners with Location Data

### **2. Advanced Filtering**
- Search by name, contact, or location
- Filter by verification status
- Reset filters functionality

### **3. Partner Management Actions**
- **View Details**: Opens comprehensive modal
- **Approve**: Sets `is_verified: true` and `is_active: true`
- **Reject**: Sets `is_verified: false` and `is_active: false`
- **Delete**: Removes partner from review list

### **4. Modern Table Design**
- Partner details with avatar
- Location information
- Service categories with images
- Contact information with icons
- Status badges
- Action buttons

### **5. Detailed Modal**
- Basic partner information
- Contact details
- Location information
- Service breakdown with images
- Approval/rejection actions

## Navigation Integration

### **Sidebar Update Required**
Add the following route to `src/components/Sidebar.jsx`:

```jsx
{
  name: 'Partner Review',
  icon: 'fas fa-user-check',
  path: '/partner-review',
  badge: pendingCount // Optional: show pending review count
}
```

### **App.jsx Route Addition**
Add the following route to `src/App.jsx`:

```jsx
import PartnerReviewScreen from './screen/PartnerReviewScreen';

// In the Routes section:
<Route path="/partner-review" element={<PrivateRoute><PartnerReviewScreen /></PrivateRoute>} />
```

## Usage

### **Accessing the Page**
Navigate to `/partner-review` to access the partner review management page.

### **Review Process**
1. **View Pending Partners**: See all partners awaiting review
2. **Review Details**: Click "View" to see comprehensive partner information
3. **Make Decision**: 
   - **Approve**: Partner becomes verified and active
   - **Reject**: Partner remains unverified and inactive
   - **Delete**: Remove partner from review list

### **Filtering and Search**
- Use search bar to find specific partners
- Filter by verification status
- Use pagination for large datasets

## Benefits

### **Administrative Efficiency**
- ✅ **Streamlined review process**
- ✅ **Quick approval/rejection actions**
- ✅ **Comprehensive partner information**
- ✅ **Advanced filtering capabilities**

### **User Experience**
- ✅ **Modern, intuitive interface**
- ✅ **Real-time updates**
- ✅ **Responsive design**
- ✅ **Clear status indicators**

### **System Integration**
- ✅ **RTK Query for data management**
- ✅ **Automatic token refresh**
- ✅ **Error handling**
- ✅ **Optimistic updates**

## Next Steps

1. **Add to Sidebar**: Update sidebar navigation
2. **Add Route**: Add route to App.jsx
3. **Test Integration**: Verify API connectivity
4. **User Testing**: Test approval/rejection workflow

The Partner Review system is now ready for integration! 🎉
