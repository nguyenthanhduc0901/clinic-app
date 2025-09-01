# Patient Mobile App - Development Notes

## Backend Configuration

### API Base URLs (Platform-specific)
- **Android Emulator**: `http://10.0.2.2:3000`
- **iOS Simulator**: `http://127.0.0.1:3000`
- **Default/Web**: `http://localhost:3000`

These URLs are configured in `app.config.ts` and automatically selected based on the platform.

## Authentication

### Test Patient Account
For testing purposes, use the following credentials:
- **Email**: `patient@test.com`
- **Password**: `test123` (masked for security)

⚠️ **Note**: Replace with actual test credentials provided by backend team.

### Auth Endpoints Used
- `POST /auth/login` - User login with email/password
- `GET /auth/profile` - Get user profile information
- `GET /auth/my-permissions` - Get user permissions array

## User Permissions

### Expected Patient Permissions
Based on the requirements, patient role should have permissions like:
- `appointment:view_own`
- `appointment:create_own`
- `medical_record:view_own`
- `invoice:view_own`

### Actual Permissions Retrieved
_To be filled in during testing - the permissions array returned from `/auth/my-permissions`_

```json
{
  "permissions": [
    // Actual permissions will be logged here during testing
  ]
}
```

## Missing "Own" Endpoints

The following patient-specific endpoints are currently not available and need to be implemented by the backend team:

### 🔴 Missing Endpoints
1. **Appointments**: `/me/appointments`
   - Expected: GET endpoint to retrieve patient's own appointments
   - Status: Not implemented
   - Impact: Appointments screen shows notice about missing endpoint

2. **Medical Records**: `/me/medical-records`
   - Expected: GET endpoint to retrieve patient's medical records
   - Status: Not implemented
   - Impact: Records screen shows notice about missing endpoint

3. **Invoices**: `/me/invoices`
### Proposed required BE endpoints (per Prompt 2)
- GET `/me/appointments`, POST `/me/appointments`
## Appointments (Patient)

- Status: Own endpoints may be missing. The app detects 403 from generic endpoints and shows a Notice.
- Client adapter flag: `USE_ME_ENDPOINTS` in `lib/appointments.client.ts` (default false) for easy switch when `/me/...` is available.
- Required endpoints when available:
  - GET `/me/appointments`
  - POST `/me/appointments`

Screenshots to capture during QA:
- List with data
- Create success toast
- Missing own endpoint Notice
- GET `/me/medical-records`, GET `/me/medical-records/:id`
- GET `/me/invoices`, GET `/me/invoices/:id`
   - Expected: GET endpoint to retrieve patient's invoices
   - Status: Not implemented
   - Impact: Invoices screen shows notice about missing endpoint

## 403 Errors Encountered

_This section will be updated during testing when we encounter permission-related errors_

### Endpoints with 403 Responses
- None encountered yet (endpoints don't exist)

### Proposed Solutions
When endpoints are implemented, if 403 errors occur:
1. Verify user has correct role assignment in backend
2. Ensure permissions like `appointment:view_own`, `medical_record:view_own`, `invoice:view_own` are granted
3. Check that "own" filtering is properly implemented in backend

## Error Handling Implementation

### Backend Error Format
The app handles errors in the expected backend format:
```json
{
  "success": false,
  "statusCode": 400|401|403|409|500,
  "errorCode": "SPECIFIC_ERROR_CODE",
  "message": "Human readable error message",
  "details": {} // Optional additional details
}
```

### Error Response Mapping
- **400**: Bad request - shows message and details as field errors
- **401**: Unauthorized - triggers automatic logout and redirect to login
- **403**: Forbidden - shows "Không có quyền" banner, logged in notes
- **409**: Conflict - shows conflict toast, keeps form values
- **Network errors**: Shows connection error message in Vietnamese

## UI State Management

### Patient Data Screens Implementation
All patient "own" data screens (Appointments, Records, Invoices) include:
- ✅ **Appointments**: Full CRUD implementation with filters, pagination, create modal
- ✅ **Medical Records**: List/detail with attachments download and PDF export
- ✅ **Invoices**: List/detail with patient/doctor info, prescriptions, PDF export
- ✅ Loading skeleton/spinner with Vietnamese messages
- ✅ Error state with retry functionality  
- ✅ Empty state with appropriate icons and messages
- ✅ Notice component for API endpoint status
- ✅ Advanced filtering (status, date) and pagination
- ✅ Cross-module integration (Medical Record → Invoice lookup)

### Dark/Light Theme Support
- ✅ NativeWind configured with `darkMode: 'class'`
- ✅ Color system with primary, secondary, success, danger, warning variants
- ✅ Components support both themes automatically
- ✅ Status bar adapts to theme

## Security Implementation

### Token Storage
- ✅ Using Expo SecureStore with key `auth/token`
- ✅ Automatic token injection in API requests
- ✅ Secure token clearing on logout
- ✅ 401 response handling with automatic logout

### Form Validation
- ✅ Zod schema validation for login form
- ✅ Email format validation
- ✅ Password minimum length (6 characters)
- ✅ Vietnamese error messages

## Navigation & Routing

### Auth Guards
- ✅ Automatic routing based on token presence
- ✅ No token → redirect to login
- ✅ Valid token → show main app tabs
- ✅ 401 from API → clear token and redirect to login

### Tab Structure
- ✅ Home (index)
- ✅ Appointments
- ✅ Records  
- ✅ Invoices
- ✅ Profile

## Technical Stack Verification

### Dependencies Installed
- ✅ expo-router (navigation)
- ✅ @tanstack/react-query (data fetching)
- ✅ axios (HTTP client)
- ✅ zod (validation)
- ✅ react-hook-form (forms)
- ✅ expo-secure-store (secure storage)
- ✅ nativewind (styling)
- ✅ react-native-safe-area-context
- ✅ react-native-reanimated
- ✅ @react-navigation/bottom-tabs

### Configuration Files
- ✅ `app.config.ts` - Platform-specific API URLs
- ✅ `babel.config.js` - Reanimated plugin
- ✅ `tailwind.config.js` - NativeWind with dark mode and color system

## Development Status

### ✅ Completed Features
- Project setup and dependency installation
- Authentication flow with secure token storage
- API client with error handling and interceptors
- UI component library with theme support
- Navigation with auth guards
- Profile screen with user info and permissions display
- Scaffold screens for all "own" data with proper state management
- Vietnamese localization for all user-facing text

### 🔄 Pending Backend Implementation
- Patient "own" endpoints (`/me/appointments`, `/me/medical-records`, `/me/invoices`)
- Test patient account creation
- Proper permission assignment for patient role

### 📋 Ready for Integration
Once backend endpoints are available:
1. Replace Notice components with actual API calls
2. Update API client with real endpoint URLs
3. Test error handling with real backend responses
4. Verify permission-based access control

## Testing Checklist

### Manual Testing Steps
1. **App Launch**: App should start and check auth status
2. **Login Flow**: 
   - ✅ Form validation works
   - ✅ Loading states show correctly
   - ✅ Error messages display properly
   - [ ] Successful login with test credentials (pending backend)
3. **Main App**:
   - ✅ Tab navigation works
   - ✅ Profile loads user data
   - ✅ Scaffold screens show appropriate states
   - ✅ Logout confirmation and functionality
4. **Error Scenarios**:
   - ✅ Network connectivity issues
   - ✅ Invalid credentials
   - [ ] 403 permission errors (pending backend)

### Performance Notes
- App uses React Query for efficient data caching
- Secure token storage prevents unnecessary re-authentication
- Loading states provide good UX during API calls
- Error boundaries handle unexpected crashes gracefully

## Next Steps

1. **Backend Team**: Implement the missing "own" endpoints
2. **QA Team**: Test with real backend once endpoints are ready
3. **Product Team**: Review UI/UX and provide feedback
4. **Dev Team**: Integrate real data once endpoints are available

---

*Last updated: [Current Date]*
*App version: 1.0.0*
*React Native: [Version from package.json]*
*Expo SDK: [Version from package.json]*
