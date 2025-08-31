// Mock API for testing UI without backend
export const MOCK_MODE = true; // Set to false when backend is ready

export const mockLoginResponse = {
  accessToken: 'mock-token-123',
  user: {
    id: '1',
    email: 'patient@test.com',
    name: 'Nguyễn Văn A',
    role: 'patient',
  },
};

export const mockProfile = {
  id: '1',
  email: 'patient@test.com',
  name: 'Nguyễn Văn A',
  role: 'patient',
  phone: '0123456789',
  dateOfBirth: '1990-01-01',
  address: '123 Đường ABC, Quận 1, TP.HCM',
};

export const mockPermissions = {
  permissions: [
    'appointment:view_own',
    'appointment:create_own', 
    'medical_record:view_own',
    'invoice:view_own'
  ],
};

// Mock functions
export const mockAuthLogin = async (data: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate login validation
  if (data.email === 'patient@test.com' && data.password === 'test123') {
    return mockLoginResponse;
  } else {
    throw {
      success: false,
      statusCode: 401,
      errorCode: 'INVALID_CREDENTIALS',
      message: 'Email hoặc mật khẩu không đúng',
    };
  }
};

export const mockGetProfile = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProfile;
};

export const mockGetMyPermissions = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPermissions;
};

export const mockUpdateProfile = async (dto: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { ...mockProfile, ...dto };
};
