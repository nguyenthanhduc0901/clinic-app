## Ứng dụng Bệnh nhân (Clinic App)

Ứng dụng di động giúp bệnh nhân quản lý lịch hẹn, hồ sơ y tế và hóa đơn. Dự án xây dựng trên Expo + React Native với TypeScript, tập trung trải nghiệm thân thiện, màu sắc theo chủ đề y tế và kiến trúc dễ mở rộng.

### Công nghệ sử dụng

- Framework: Expo + React Native
- Ngôn ngữ: TypeScript
- Điều hướng: Expo Router (file-based routing)
- State/Server cache: TanStack Query
- HTTP client: Axios (interceptors, inject token, xử lý lỗi)
- Form/Validation: React Hook Form + Zod
- Lưu trữ an toàn: Expo SecureStore
- Styling: NativeWind + theme tập trung (`utils/theme.ts`)

### Cấu trúc dự án (chính)

```
clinic-app/
├── app/                    # File-based routing (Expo Router)
│   ├── (auth)/login.tsx    # Màn đăng nhập
│   ├── (tabs)/             # Tabs chính (Home, Appointments, Records, Invoices, Profile)
│   │   ├── index.tsx       # Trang chủ (hero + CTA + lưới truy cập nhanh)
│   │   ├── appointments/   # Lịch hẹn: danh sách, lọc, tạo, chi tiết
│   │   ├── records/        # Hồ sơ y tế: danh sách, chi tiết, attachments
│   │   ├── invoices/       # Hóa đơn: danh sách, lọc, chi tiết
│   │   └── profile.tsx     # Hồ sơ cá nhân
│   └── _layout.tsx         # Root layout + providers
├── components/ui/          # Thư viện UI dùng lại (Button, TextInput, ...)
├── hooks/                  # Hooks cho dữ liệu và session
├── lib/                    # API clients, auth, axios config
├── providers/              # Context providers (Toast, QueryClient, ...)
├── utils/                  # Tiện ích và theme
│   ├── date.ts             # Định dạng ngày
│   └── theme.ts            # Theme tập trung: màu sắc, spacing, radius, typography
└── assets/                 # Hình ảnh, logo, favicon, banner
```

### Thương hiệu & Tài sản (Assets)

- Biểu tượng ứng dụng: `assets/icon.png`
- Ảnh splash: `assets/banner.png` (định nghĩa trong `app.config.ts`/`app.json`)
- Favicon web: `assets/favicon.ico`
- Logo ứng dụng: `assets/logo.png` (dùng ở login/home header)
- Banner trang chủ: `assets/banner-page.png`

### Cấu hình Backend

- API base URL được cấu hình theo nền tảng trong `app.config.ts` (`extra.apiBaseUrl`):
  - Android Emulator: `http://10.0.2.2:3000`
  - iOS Simulator: `http://127.0.0.1:3000`
  - Mặc định: `http://localhost:3000`
- Đổi các URL này theo môi trường triển khai thực tế trước khi build.

### Cài đặt & Chạy

1) Cài phụ thuộc
```bash
npm install
```

2) Khởi động dev server (xóa cache)
```bash
npx expo start -c
```

3) Chạy trên thiết bị/emulator
- Android: nhấn `a` hoặc `npx expo run:android`
- iOS (macOS): nhấn `i` hoặc `npx expo run:ios`
- Web: nhấn `w` hoặc `npx expo run:web`

### Danh sách tính năng đã hoàn thành

- Xác thực & Phiên đăng nhập
  - Form đăng nhập với xác thực Zod
  - Lưu token an toàn bằng Expo SecureStore
  - Làm mới session sau đăng nhập, cache hồ sơ/quyền bằng React Query
  - Xử lý lỗi chi tiết: 400/401/403/409, network error

- Trang chủ (Home UX)
  - Header có logo và mô tả ngắn
  - Hero banner (banner-page) với nút CTA chính/phụ
  - Lưới truy cập nhanh 2x2: Lịch hẹn, Hồ sơ, Hóa đơn, Tài khoản

- Lịch hẹn (Appointments)
  - Danh sách lịch hẹn, phân trang (Paginator)
  - Bộ lọc theo ngày và trạng thái, đặt lại nhanh
  - Tạo lịch hẹn (Modal + DateInput auto-format)
  - Badge trạng thái (waiting/confirmed/checked_in/in_progress/completed/cancelled)
  - Trạng thái tải/lỗi/trống (LoadingSpinner, ErrorMessage, EmptyState)

- Hóa đơn (Invoices)
  - Danh sách hóa đơn, lọc theo trạng thái/ngày
  - Định dạng tiền tệ, ngày tháng
  - Badge trạng thái hóa đơn (pending/paid/cancelled/refunded)
  - Trạng thái tải/lỗi/trống

- Hồ sơ y tế (Medical Records)
  - Khung màn danh sách và chi tiết
  - Trang attachments mẫu cho bản ghi

- Hồ sơ cá nhân (Profile)
  - Hiển thị thông tin và quyền

- Thư viện UI dùng lại (components/ui)
  - Button (primary/secondary/outline/danger) có trạng thái loading
  - TextInput + FormField tích hợp RHF
  - DateInput chuẩn hóa nhập YYYY-MM-DD + xem trước format
  - Notice (info/warning/error/success)
  - ErrorMessage (kèm nút Thử lại)
  - LoadingSpinner, Paginator
  - StatusBadge/InvoiceStatusBadge/MedicalRecordStatusBadge đồng bộ màu theo theme

- Theme y tế tập trung (`utils/theme.ts`)
  - Bảng màu: primary/secondary, success/warning/danger, text/border/bg
  - Spacing, border radius, typography
  - Các components đã refactor đồng bộ màu/spacing

- API & Kiến trúc dữ liệu
  - Axios client có interceptors, inject token, normalize lỗi
  - API clients: `lib/appointments.client.ts`, `lib/invoices.client.ts`, `lib/medicalRecords.client.ts`
  - Hooks dữ liệu: `useAppointments`, `useInvoices`, `useMedicalRecords`
  - Kiểu dữ liệu & schema: `types/*`, `schemas/appointments.ts`
  - Query keys tập trung: `constants/queryKeys.ts`

### Hạn chế/Việc còn lại

- Backend endpoints "own" có thể chưa sẵn: `/me/appointments`, `/me/medical-records`, `/me/invoices`
- Khi backend sẵn sàng: nối API thật, hoàn thiện màn chi tiết/đính kèm và thử nghiệm end-to-end

### Lệnh hữu ích

```bash
# Khởi động dev server (clear cache)
npx expo start -c

# Chạy nền tảng cụ thể
npx expo run:android
npx expo run:ios
npx expo run:web

# Kiểm tra TypeScript
npx tsc --noEmit
```

---

# Clinic Patient Mobile App

A React Native mobile application for patients to manage appointments, medical records, and invoices.

## Tech Stack

- **Framework**: Expo + React Native
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: TanStack Query
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Styling**: NativeWind (Tailwind for React Native)
- **Storage**: Expo SecureStore
- **Theme**: Centralized medical palette at `utils/theme.ts`

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- For device testing:
  - Android: Android Studio + Android SDK
  - iOS: Xcode (macOS only)
  - Or use Expo Go app on your device

## Installation

1. **Clone and install dependencies**:
   ```bash
   cd clinic-app
   npm install
   ```

2. **Start the development server**:
   ```bash
   npx expo start -c
   ```

3. **Run on your preferred platform**:
   - **Android**: Press `a` in terminal or `npx expo run:android`
   - **iOS**: Press `i` in terminal or `npx expo run:ios` (macOS only)
   - **Web**: Press `w` in terminal or `npx expo run:web`
   - **Device**: Scan QR code with Expo Go app

## Backend Configuration

The app is configured to connect to backend APIs at:
- **Android Emulator**: `http://10.0.2.2:3000`
- **iOS Simulator**: `http://127.0.0.1:3000`

These URLs are automatically selected based on the platform in `app.config.ts`.

## Development Workflow

### Quick Smoke Test

1. **Launch the app**: Should show loading screen then navigate to login
2. **Login form**: 
   - Try invalid credentials to see error handling
   - Use test credentials once backend is ready
3. **Main app navigation**:
   - Navigate between tabs
   - Check profile screen loads
   - Verify logout works correctly

### Test Credentials

Use these credentials for testing (update when backend provides real test accounts):
- **Email**: `patient@test.com`
- **Password**: `test123`

## Project Structure

```
clinic-app/
├── app/                    # Expo Router file-based routing
│   ├── (auth)/            # Auth screens
│   │   └── login.tsx      # Login screen
│   ├── (tabs)/            # Main app tabs
│   │   ├── index.tsx      # Home screen
│   │   ├── appointments/  # Appointments section
│   │   ├── records/       # Medical records section
│   │   ├── invoices/      # Invoices section
│   │   └── profile.tsx    # Profile screen
│   ├── _layout.tsx        # Root layout with providers
│   └── index.tsx          # Entry point with auth routing
├── components/ui/         # Reusable UI components
├── lib/                   # Core utilities
│   ├── api.ts            # API client and auth endpoints
│   └── auth.ts           # Token storage utilities
├── hooks/                 # Custom React hooks
│   └── useSession.ts     # Authentication session hook
├── providers/            # React context providers
│   └── AppProviders.tsx  # App-wide providers setup
├── utils/                # Utilities & theme
│   ├── date.ts         
│   └── theme.ts         # Centralized theme (colors, spacing, radius, typography)
└── assets/               # Images and static assets
```

## Branding & Assets

Current assets in use:
- App icon: `assets/icon.png` (1024x1024, no transparency)
- Splash image: `assets/banner.png` (configured via Expo)
- Web favicon: `assets/favicon.ico`
- App logo: `assets/logo.png` (login/home header)
- Home banner: `assets/banner-page.png` (home hero)

To change branding, replace the files above with images using the same filenames/paths. Splash/favicon/icon are configured in `app.config.ts` and `app.json`.

## Features Implemented

### ✅ Authentication
- Secure login with form validation
- Token storage using Expo SecureStore
- Automatic logout on 401 responses
- Auth guards for protected routes

### ✅ Navigation
- File-based routing with Expo Router
- Bottom tab navigation for main app
- Auth flow routing (login ↔ main app)

### ✅ UI Components
- Centralized theme palette (`utils/theme.ts`) for consistent medical colors
- Form components with validation
- Loading, error, and empty states
- Vietnamese localization

### ✅ Home Experience
- Header with logo and subtitle
- Hero banner with primary/outline CTAs
- 2x2 quick actions grid: Appointments, Records, Invoices, Profile

### ✅ API Integration
- Axios client with request/response interceptors
- Error handling with backend error format
- Automatic token injection
- Request/response normalization

### ✅ Profile Management
- User profile display
- Permissions listing
- Logout functionality

### 🔄 Scaffold Screens (Ready for Backend Integration)
- **Appointments**: UI ready, waiting for `/me/appointments` endpoint
- **Medical Records**: UI ready, waiting for `/me/medical-records` endpoint  
- **Invoices**: UI ready, waiting for `/me/invoices` endpoint

## Known Issues & Limitations

### Missing Backend Endpoints
The following endpoints need to be implemented:
- `GET /me/appointments` - Patient's appointments
- `GET /me/medical-records` - Patient's medical records
- `GET /me/invoices` - Patient's invoices

### Temporary Workarounds
- Scaffold screens show notices about missing endpoints
- Demo buttons to test UI states (loading, error, empty)
- Placeholder content in data sections

## Error Handling

The app handles various error scenarios:
- **Network errors**: User-friendly connection messages
- **401 Unauthorized**: Automatic logout and redirect
- **403 Forbidden**: Permission denied messages
- **400 Bad Request**: Form validation errors
- **409 Conflict**: Conflict resolution messages

## Development Commands

```bash
# Start development server
npx expo start -c

# Run on specific platforms
npx expo run:android
npx expo run:ios
npx expo run:web

# Type checking
npx tsc --noEmit

# Clear cache
npx expo start -c
```

## Troubleshooting

### Common Issues

1. **Metro bundler errors**: Clear cache with `npx expo start -c`
2. **Module resolution**: Restart the development server
3. **Android emulator connectivity**: Ensure `http://10.0.2.2:3000` is accessible
4. **iOS simulator connectivity**: Ensure `http://127.0.0.1:3000` is accessible

### Debug Tools

- **React Native Debugger**: For debugging React components and Redux
- **Expo DevTools**: Built-in debugging tools
- **Console logs**: Check terminal and device console for errors

## Contributing

1. Follow the established project structure
2. Use TypeScript for all new code
3. Include proper error handling
4. Add Vietnamese translations for user-facing text
5. Test on both Android and iOS platforms

## Production Deployment

### Building for Production

```bash
# Build for Android
npx expo build:android

# Build for iOS
npx expo build:ios

# Or use EAS Build (recommended)
npx eas build --platform android
npx eas build --platform ios
```

### Environment Configuration

Update `app.config.ts` with production API URLs before building.

---

For detailed development notes and backend integration status, see [NOTES.md](./NOTES.md).