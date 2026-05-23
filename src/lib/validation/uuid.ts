/**
 * UUID Validation Utility
 * Enforces strict UUID integrity across the application
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface UUIDValidationResult {
  isValid: boolean;
  error?: string;
  value: string;
}

/**
 * Validates if a string is a valid UUID v4 format
 */
export function isValidUUID(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  return UUID_REGEX.test(value);
}

/**
 * Validates UUID with detailed error reporting
 */
export function validateUUID(value: unknown, fieldName: string = 'ID'): UUIDValidationResult {
  const result: UUIDValidationResult = {
    isValid: false,
    value: String(value)
  };

  // Check if value exists
  if (value === null || value === undefined) {
    result.error = `${fieldName} is null or undefined`;
    console.error('[UUID_VALIDATION_ERROR]', result.error, { value });
    return result;
  }

  // Check if value is a string
  if (typeof value !== 'string') {
    result.error = `${fieldName} must be a string, received ${typeof value}`;
    console.error('[UUID_VALIDATION_ERROR]', result.error, { value, type: typeof value });
    return result;
  }

  // Check if value is empty
  if (value.trim() === '') {
    result.error = `${fieldName} is an empty string`;
    console.error('[UUID_VALIDATION_ERROR]', result.error);
    return result;
  }

  // Check if value is numeric
  if (!isNaN(Number(value))) {
    result.error = `${fieldName} appears to be numeric (${value}), must be UUID format`;
    console.error('[UUID_VALIDATION_ERROR]', result.error, { value });
    return result;
  }

  // Check UUID format
  if (!UUID_REGEX.test(value)) {
    result.error = `${fieldName} is not a valid UUID format: ${value}`;
    console.error('[UUID_VALIDATION_ERROR]', result.error, { value });
    return result;
  }

  // Valid UUID
  result.isValid = true;
  delete result.error;
  console.log('[UUID_VALIDATION_SUCCESS]', `${fieldName} is valid UUID:`, value);
  return result;
}

/**
 * Validates UUID and throws error if invalid
 */
export function assertValidUUID(value: unknown, fieldName: string = 'ID'): asserts value is string {
  const validation = validateUUID(value, fieldName);
  if (!validation.isValid) {
    throw new Error(validation.error || `Invalid UUID for ${fieldName}`);
  }
}

/**
 * Sanitizes and validates UUID, returns null if invalid
 */
export function sanitizeUUID(value: unknown, fieldName: string = 'ID'): string | null {
  const validation = validateUUID(value, fieldName);
  return validation.isValid ? validation.value : null;
}
