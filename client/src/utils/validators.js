// Validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Email pattern
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  name: /^[a-zA-Z\s'-]{2,50}$/, // 2-50 chars, letters, spaces, hyphens, and apostrophes
  phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, // Phone number with various formats
  url: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\- .\/?%&=]*)?$/, // URL pattern
  username: /^[a-zA-Z0-9_-]{3,20}$/, // 3-20 chars, letters, numbers, underscores, hyphens
};

// Validation error messages
const messages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  password: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
  confirmPassword: 'Passwords do not match',
  name: 'Please enter a valid name (2-50 characters, letters only)',
  minLength: (length) => `Must be at least ${length} characters long`,
  maxLength: (length) => `Must be less than ${length} characters`,
  pattern: 'Invalid format',
};

// Validation functions
const validators = {
  required: (value) => (value ? undefined : messages.required),
  email: (value) => (patterns.email.test(value) ? undefined : messages.email),
  password: (value) => (patterns.password.test(value) ? undefined : messages.password),
  confirmPassword: (value, allValues, fieldName) => 
    value === allValues[fieldName.replace('confirm', '').toLowerCase()] 
      ? undefined 
      : messages.confirmPassword,
  minLength: (min) => (value) => 
    value && value.length < min ? messages.minLength(min) : undefined,
  maxLength: (max) => (value) => 
    value && value.length > max ? messages.maxLength(max) : undefined,
  pattern: (pattern) => (value) => 
    pattern.test(value) ? undefined : messages.pattern,
};

// Compose multiple validators
const composeValidators = (...validators) => (value, allValues, fieldName) =>
  validators.reduce(
    (error, validator) => error || validator(value, allValues, fieldName),
    undefined
  );

// Common validation rules
export const validationRules = {
  email: composeValidators(
    validators.required,
    validators.email
  ),
  password: composeValidators(
    validators.required,
    validators.password
  ),
  confirmPassword: (value, allValues) =>
    validators.confirmPassword(value, allValues, 'confirmPassword'),
  name: composeValidators(
    validators.required,
    validators.pattern(patterns.name)
  ),
  phone: composeValidators(
    validators.required,
    validators.pattern(patterns.phone)
  ),
};

// Validate form function
export const validateForm = (values, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const validate = rules[field];
    const error = validate(values[field], values, field);
    
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

// Check if form is valid
export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
};

export default {
  patterns,
  messages,
  validators,
  composeValidators,
  validationRules,
  validateForm,
  isFormValid,
};
