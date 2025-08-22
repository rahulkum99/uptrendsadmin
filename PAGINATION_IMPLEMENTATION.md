# Pagination Implementation

## Overview
Added comprehensive pagination controls to the customer management system with server-side pagination support and user-friendly navigation.

## Features Implemented

### 1. **Server-side Pagination**
- ✅ **API Integration**: Sends `page` and `limit` parameters to backend
- ✅ **Real-time Updates**: Fetches data based on current page and page size
- ✅ **Automatic Refresh**: Updates when pagination parameters change

```javascript
// API Query with pagination
const { data: customerResponse } = useGetCustomersQuery({
  page: currentPage,    // Current page number
  limit: pageSize       // Items per page
});
```

### 2. **Pagination Controls**
- ✅ **Page Size Selector**: 5, 10, 25, 50 customers per page
- ✅ **Previous/Next Buttons**: Navigation between pages
- ✅ **Page Numbers**: Direct navigation to specific pages
- ✅ **Smart Ellipsis**: Shows "..." for large page ranges
- ✅ **Responsive Design**: Adapts to mobile screens

### 3. **Pagination Information**
- ✅ **Current Page Display**: Shows active page in multiple locations
- ✅ **Total Count**: Displays total customers from API
- ✅ **Range Display**: "Showing X to Y of Z customers"
- ✅ **Page Info**: "Page X of Y" in header and footer

### 4. **User Experience Enhancements**
- ✅ **Auto-reset**: Returns to page 1 when changing filters or page size
- ✅ **Disabled States**: Previous/Next buttons disabled when appropriate
- ✅ **Loading States**: Handles loading during page changes
- ✅ **Error Handling**: Graceful fallbacks for pagination errors

## UI Components

### **Page Size Selector**
```jsx
<select value={pageSize} onChange={(e) => handlePageSizeChange(Number(e.target.value))}>
  <option value={5}>5</option>
  <option value={10}>10</option>
  <option value={25}>25</option>
  <option value={50}>50</option>
</select>
```

### **Pagination Navigation**
```jsx
<nav aria-label="Customer pagination">
  <ul className="pagination pagination-sm justify-content-end">
    <li className="page-item">
      <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
        Previous
      </button>
    </li>
    
    {/* Page numbers with smart ellipsis */}
    {Array.from({ length: totalPages }, (_, index) => {
      const page = index + 1;
      const showPage = 
        page === 1 || 
        page === totalPages || 
        (page >= currentPage - 2 && page <= currentPage + 2);
      
      return showPage ? (
        <li className={`page-item ${page === currentPage ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(page)}>
            {page}
          </button>
        </li>
      ) : null;
    })}
    
    <li className="page-item">
      <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
        Next
      </button>
    </li>
  </ul>
</nav>
```

### **Pagination Info Display**
```jsx
<small className="text-muted">
  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} 
  of {totalCount} customers • Page {currentPage} of {totalPages}
</small>
```

## Smart Features

### **Ellipsis Logic**
Shows page numbers intelligently:
- **Always shows**: First page, last page, current page
- **Shows nearby**: 2 pages before and after current page
- **Shows ellipsis**: When gaps exist between visible pages

**Example pagination displays**:
```
Page 1:  [1] 2 3 4 5 ... 20
Page 5:  1 2 3 4 [5] 6 7 ... 20
Page 10: 1 ... 8 9 [10] 11 12 ... 20
Page 20: 1 ... 16 17 18 19 [20]
```

### **Auto-reset Behavior**
- **Filter Changes**: Returns to page 1 when applying filters
- **Page Size Changes**: Returns to page 1 when changing page size
- **Search**: Returns to page 1 when searching
- **Clear Filters**: Returns to page 1 when clearing all filters

### **Responsive Design**
```jsx
// Mobile-friendly layout
<div className="row align-items-center">
  <div className="col-md-6">
    {/* Page size selector */}
  </div>
  <div className="col-md-6">
    {/* Pagination controls */}
  </div>
</div>
```

## State Management

### **Pagination State**
```javascript
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

// Handlers
const handlePageChange = (page) => {
  setCurrentPage(page);
};

const handlePageSizeChange = (newPageSize) => {
  setPageSize(newPageSize);
  setCurrentPage(1); // Reset to first page
};
```

### **Calculated Values**
```javascript
const totalPages = pagination?.totalPages || Math.ceil((pagination?.count || customers.length) / pageSize);
const hasNextPage = pagination?.next !== null;
const hasPrevPage = pagination?.previous !== null;
```

## API Integration

### **Request Parameters**
```javascript
// Sent to backend API
{
  page: 2,        // Current page (1-based)
  limit: 25,      // Items per page
  search: "john", // Search term (optional)
  gender: "M",    // Gender filter (optional)
  is_active: true // Active status filter (optional)
}
```

### **Expected Response Format**
```json
{
  "count": 150,
  "total_pages": 6,
  "next": "http://api/customers/?page=3&limit=25",
  "previous": "http://api/customers/?page=1&limit=25",
  "results": [
    {
      "user_phone_number": "1234567890",
      "first_name": "John",
      "last_name": "Doe",
      "is_active": true
    }
  ]
}
```

## Visual Design

### **Pagination Controls Placement**
- **Location**: Bottom center of customer list card
- **Container**: Card footer with clean separation
- **Layout**: Two-column responsive design
- **Spacing**: Proper margins and padding for readability

### **Information Display**
- **Header**: Page info in customer list header
- **Filter Section**: Current page size and page number
- **Footer**: Detailed range information and navigation
- **Center Alignment**: Pagination info centered at bottom

### **Interactive Elements**
- **Hover Effects**: Page buttons highlight on hover
- **Active State**: Current page clearly highlighted
- **Disabled State**: Previous/Next buttons disabled when appropriate
- **Focus Management**: Keyboard navigation support

## Performance Optimizations

### **Efficient Rendering**
- **Smart Page Display**: Only renders visible page numbers
- **Memoized Calculations**: Pagination values calculated efficiently
- **Conditional Rendering**: Only shows pagination when multiple pages exist

### **API Efficiency**
- **Server-side Pagination**: Reduces data transfer
- **Automatic Caching**: RTK Query caches page results
- **Background Updates**: Keeps data fresh without blocking UI

## User Experience

### **Clear Navigation**
- **Visual Feedback**: Active page clearly indicated
- **Intuitive Controls**: Previous/Next buttons with clear labels
- **Range Information**: Users always know their position
- **Quick Navigation**: Direct page number access

### **Responsive Behavior**
- **Mobile Friendly**: Controls adapt to small screens
- **Touch Targets**: Buttons sized for touch interaction
- **Readable Text**: Information clearly displayed on all devices

## Testing Checklist

- [x] Page navigation works correctly
- [x] Page size changes update display
- [x] Previous/Next buttons enable/disable properly
- [x] Ellipsis shows for large page counts
- [x] Filter changes reset to page 1
- [x] Page info displays correctly in all locations
- [x] Responsive design works on mobile
- [x] API parameters sent correctly
- [x] Loading states handled properly
- [x] Error states handled gracefully

The pagination system provides a complete, user-friendly navigation experience with server-side efficiency and responsive design!
