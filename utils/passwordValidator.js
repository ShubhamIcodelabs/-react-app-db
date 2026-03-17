// Password validation utility
export const validatePassword = (password) => {
    const errors = [];
    
    if (!password) {
        errors.push("Password is required");
        return { isValid: false, errors };
    }
    
    if (password.length < 6) {
        errors.push("Password must be at least 6 characters long");
    }
    
    if (password.length > 128) {
        errors.push("Password must be less than 128 characters");
    }
    
    // Check for at least one number
    if (!/\d/.test(password)) {
        errors.push("Password must contain at least one number");
    }
    
    // Check for at least one letter
    if (!/[a-zA-Z]/.test(password)) {
        errors.push("Password must contain at least one letter");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Simple password strength checker
export const getPasswordStrength = (password) => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    
    if (score < 3) return "weak";
    if (score < 5) return "medium";
    return "strong";
};