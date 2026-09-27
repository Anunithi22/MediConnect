import * as authService from '../services/authService.js';

export const registerPatient = async (req, res, next) => {
  try {
    const result = await authService.registerPatient(req.body);
    return res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const registerDoctor = async (req, res, next) => {
  try {
    const result = await authService.registerDoctor(req.body);
    return res.status(201).json({
      success: true,
      message: result.message,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  // In JWT architecture without stateful token blacklisting, client removes stored token
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully. Authentication token cleared.',
  });
};

// Test endpoints for verifying role middleware
export const testPatientOnly = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Access granted to patient-only area.',
    userId: req.user._id,
    role: req.user.role,
  });
};

export const testDoctorOnly = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Access granted to doctor-only area.',
    userId: req.user._id,
    role: req.user.role,
  });
};

export const testAdminOnly = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Access granted to admin-only area.',
    userId: req.user._id,
    role: req.user.role,
  });
};
