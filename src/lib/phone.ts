/**
 * Phone Number Validation and Normalization for MockMate
 * Primary focus: Indian Phone Numbers (+91 / 10 digits starting with 6, 7, 8, 9)
 * Supports graceful expansion to international E.164 formats in the future.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized?: string;
  displayFormatted?: string;
  error?: string;
}

/**
 * Normalizes an Indian phone number to standard E.164 format (+91XXXXXXXXXX)
 * Accepts inputs like:
 * - "9876543210"
 * - "+91 98765 43210"
 * - "09876543210"
 * - "+91-9876543210"
 */
export function normalizeIndianPhoneNumber(input: string): PhoneValidationResult {
  if (!input || typeof input !== "string") {
    return {
      isValid: false,
      error: "Phone number is required",
    };
  }

  // Remove spaces, hyphens, brackets, dots
  let cleaned = input.trim().replace(/[\s\-\(\)\.]/g, "");

  // Remove leading +91 or 91 if present
  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  // An Indian mobile number must be exactly 10 digits and start with 6, 7, 8, or 9
  const indianMobileRegex = /^[6-9]\d{9}$/;

  if (!indianMobileRegex.test(cleaned)) {
    return {
      isValid: false,
      error:
        "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9",
    };
  }

  const normalized = `+91${cleaned}`;
  const displayFormatted = `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;

  return {
    isValid: true,
    normalized,
    displayFormatted,
  };
}

/**
 * Helper to mask phone numbers for privacy-safe display
 * e.g. "+91 98765 43210" -> "+91 98*** **210"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 10) return "******";
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length === 13 && cleaned.startsWith("+91")) {
    return `+91 ${cleaned.slice(3, 5)}*** **${cleaned.slice(10)}`;
  }
  return `${cleaned.slice(0, 2)}******${cleaned.slice(-2)}`;
}
