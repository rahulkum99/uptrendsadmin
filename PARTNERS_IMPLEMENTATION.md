# Partners API Implementation

## Overview
Implemented RTK Query for partners management with server-side pagination, search functionality, and comprehensive partner data display.

## Features Implemented

### 1. **RTK Query API Integration**
- ✅ **Partner API Slice**: `src/redux/api/partnerApi.js`
- ✅ **Server-side Pagination**: Sends `page` and `limit` parameters
- ✅ **Search Functionality**: Uses `q` parameter for search
- ✅ **Status Filtering**: Filter by `is_active` status
- ✅ **Automatic Token Refresh**: Handles 401 errors with token refresh
- ✅ **Cache Management**: RTK Query caching and invalidation

### 2. **API Endpoints**
```javascript
// Get partners with pagination and filters
GET /adminuser/all-patner/?page=1&limit=10&q=hair&is_active=true

// Update partner status
PATCH /adminuser/all-patner/{uid}/
Body: { is_active: true/false }

// Delete partner
DELETE /adminuser/all-patner/{uid}/
```

### 3. **Response Structure**
```json
{
  "count": 7,
  "total_pages": 2,
  "next": "http://127.0.0.1:8000/adminuser/all-patner/?page=2",
  "previous": null,
  "results": [
    {
      "uid": "693a4850-6390-4d01-ae3d-28d250797f19",
      "shop": "00b17c25-09ed-4702-894a-a9ccc2f55a45",
      "service_name": "Lakme Salon",
      "service_type": ["9e61e166-f71d-4f31-bfd7-fa30eb32d4e4"],
      "service_type_display": [
        {
          "uid": "9e61e166-f71d-4f31-bfd7-fa30eb32d4e4",
          "category_name": "Salons",
          "category_image": "https://salon4me.s3.amazonaws.com/servicescategory/Hair_Salon.png",
          "main_image": "https://salon4me.s3.amazonaws.com/servicescategory/Salon.jpg",
          "small_desc": "Cut, Colour, Styling",
          "main_desc": "From bold cuts to flawless color, discover hair artistry that turns heads."
        }
      ],
      "contact_number": "7000207351",
      "email": "nairsid6@gmail.com",
      "address": "6MVX+VF, India",
      "address2": "Ramamurthy Nagar",
      "landmark": "Near DMart",
      "city": "Purena",
      "state": "Chhattisgarh",
      "pincode": 492012,
      "established_year": "2002",
      "description": "Nestled by the calm waters...",
      "is_active": true,
      "latitude": "13.033124",
      "longitude": "77.687481"
    }
  ]
}
```

## UI Components

### **Statistics Dashboard**
```jsx
// 4 Statistics Cards
👥 Total: 7        ✅ Active: 6       🏢 Services: 7      📞 Contact: 7
Total Partners   Active Partners   With Services    With Contact
```

### **Filter Controls**
```jsx
// Search and Filter Layout
[Search Input - 6 cols] [Status Filter - 3 cols] [Reset - 3 cols]
```

### **Partner List Table**
```jsx
// Table Columns
PARTNER | LOCATION | SERVICES | CONTACT | STATUS | ACTIONS
```

### **Partner Display**
- **Avatar**: First letter of service name in circular badge
- **Partner Info**: Service name, ID (truncated), Established year
- **Location**: City, State, Full address
- **Services**: Service type badges (Salons, Spas, etc.)
- **Contact**: Phone number and email with icons
- **Status**: Active/Inactive badge
- **Actions**: View, Edit, Toggle Status, Delete

## Search Functionality

### **Search Parameters**
```javascript
// API Query with search
useGetPartnersQuery({
  page: currentPage,
  limit: pageSize,
  search: searchTerm || undefined,  // Uses 'q' parameter
  is_active: statusFilter === 'all' ? undefined : statusFilter === 'active'
})
```

### **Search Examples**
```
baseUrl/adminuser/all-patner/?q=hair
baseUrl/adminuser/all-patner/?q=salon
baseUrl/adminuser/all-patner/?q=lakme
```

## Pagination Implementation

### **Server-side Pagination**
- ✅ **Page Size Selector**: 5, 10, 25, 50 partners per page
- ✅ **Smart Navigation**: Previous/Next with page numbers
- ✅ **Ellipsis Logic**: Shows "..." for large page ranges
- ✅ **Auto-reset**: Returns to page 1 when changing filters
- ✅ **Range Display**: "Showing X to Y of Z partners"

### **Pagination Controls**
```jsx
// Bottom center pagination
[Page Size: 10 per page] [Previous] [1] [2] [3] ... [10] [Next]
Showing 1 to 10 of 7 partners • Page 1 of 1
```

## Partner Actions

### **Status Toggle**
```javascript
const handleToggleStatus = async (partner) => {
  try {
    await updatePartnerStatus({
      uid: partner.uid,
      is_active: !partner.is_active
    }).unwrap();
    toast.success(`Partner ${partner.is_active ? 'deactivated' : 'activated'} successfully`);
  } catch (error) {
    toast.error('Failed to update partner status');
  }
};
```

### **Delete Partner**
```javascript
const handleDeletePartner = async (partner) => {
  if (window.confirm(`Are you sure you want to delete ${partner.service_name}?`)) {
    try {
      await deletePartner(partner.uid).unwrap();
      toast.success('Partner deleted successfully');
    } catch (error) {
      toast.error('Failed to delete partner');
    }
  }
};
```

## State Management

### **Local State**
```javascript
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
const [selectedPartner, setSelectedPartner] = useState(null);
```

### **RTK Query Hooks**
```javascript
const { data: partnerResponse, isLoading, error, refetch } = useGetPartnersQuery(params);
const [updatePartnerStatus] = useUpdatePartnerStatusMutation();
const [deletePartner] = useDeletePartnerMutation();
```

### **Calculated Values**
```javascript
const partners = partnerResponse?.results || [];
const pagination = partnerResponse?.results ? {
  count: partnerResponse.count,
  totalPages: partnerResponse.total_pages,
  next: partnerResponse.next,
  previous: partnerResponse.previous
} : null;

const totalPages = pagination?.totalPages || Math.ceil((pagination?.count || partners.length) / pageSize);
const hasNextPage = pagination?.next !== null;
const hasPrevPage = pagination?.previous !== null;
```

## Error Handling

### **Loading States**
```jsx
{isLoading ? (
  <div className="text-center py-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="mt-2 text-muted">Loading partners...</p>
  </div>
) : null}
```

### **Error States**
```jsx
{error ? (
  <div className="text-center py-5">
    <FaUsers size={48} className="text-muted mb-3" />
    <h5 className="text-muted">Error loading partners</h5>
    <p className="text-muted">{error?.data?.message || 'Something went wrong'}</p>
    <button className="btn btn-primary" onClick={refetch}>
      Try Again
    </button>
  </div>
) : null}
```

### **Empty States**
```jsx
{partners.length === 0 ? (
  <div className="text-center py-5">
    <FaUsers size={48} className="text-muted mb-3" />
    <h5 className="text-muted">No partners found</h5>
    <p className="text-muted">Try adjusting your search or filters</p>
  </div>
) : null}
```

## Visual Design

### **Partner Cards**
- **Circular Avatars**: First letter of service name
- **Service Badges**: Color-coded service type indicators
- **Contact Icons**: Phone and email with appropriate icons
- **Status Badges**: Green for active, gray for inactive
- **Action Buttons**: View, Edit, Toggle, Delete with icons

### **Responsive Layout**
- **Desktop**: Full table with all columns
- **Mobile**: Responsive table with horizontal scroll
- **Pagination**: Adapts to screen size
- **Statistics**: 4-column grid on desktop, stacked on mobile

## Performance Optimizations

### **RTK Query Benefits**
- ✅ **Automatic Caching**: Reduces API calls
- ✅ **Background Updates**: Keeps data fresh
- ✅ **Optimistic Updates**: Immediate UI feedback
- ✅ **Error Handling**: Centralized error management
- ✅ **Loading States**: Built-in loading indicators

### **Efficient Rendering**
- ✅ **Memoized Statistics**: Calculated only when data changes
- ✅ **Conditional Rendering**: Only shows pagination when needed
- ✅ **Smart Search**: Debounced search input
- ✅ **Optimized Filters**: Server-side filtering

## API Integration

### **Store Configuration**
```javascript
// src/redux/store.jsx
import { partnerApi } from './api/partnerApi';

export const store = configureStore({
  reducer: {
    [partnerApi.reducerPath]: partnerApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(partnerApi.middleware),
});
```

### **Query Parameters**
```javascript
// Supported query parameters
{
  page: 1,           // Page number (1-based)
  limit: 10,         // Items per page
  q: "hair",         // Search term
  is_active: true,   // Status filter
  service_type: "uuid", // Service type filter
  city: "Bangalore"  // City filter
}
```

## User Experience

### **Intuitive Navigation**
- **Clear Search**: Placeholder text guides users
- **Visual Feedback**: Loading spinners and error messages
- **Confirmation Dialogs**: Delete confirmations
- **Toast Notifications**: Success/error feedback
- **Keyboard Support**: Accessible navigation

### **Professional Design**
- **Consistent Styling**: Bootstrap theme integration
- **Icon Usage**: FontAwesome icons for better UX
- **Color Coding**: Status-based color schemes
- **Typography**: Clear hierarchy and readability
- **Spacing**: Proper margins and padding

## Testing Checklist

- [x] API integration works correctly
- [x] Pagination navigation functions properly
- [x] Search functionality filters results
- [x] Status toggle updates partner status
- [x] Delete partner removes from list
- [x] Loading states display correctly
- [x] Error states handle failures gracefully
- [x] Empty states show appropriate messages
- [x] Responsive design works on mobile
- [x] Statistics calculate correctly
- [x] Filter reset functionality works
- [x] Toast notifications display properly

The partners management system provides a complete, professional interface for managing salon partners with real-time data, efficient pagination, and comprehensive search capabilities!
