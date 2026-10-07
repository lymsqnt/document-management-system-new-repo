export type AccountRecoveryData = {
    email: string;
    notRobot: boolean;
};

export type AccountRecoveryErrors = {
    email?: string;
    notRobot?: string;
};

export function validateAccountRecovery(
    data: AccountRecoveryData
): AccountRecoveryErrors {
    const errors: AccountRecoveryErrors = {};

    const email = data.email.trim();

    if (!email) {
        errors.email = "Email address is required.";
    } else if (email !== email.toLowerCase()) {
        errors.email = "Email address must be in lowercase.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Please enter a valid email address.";
    }

    if (!data.notRobot) {
        errors.notRobot = "Please complete the security verification.";
    }

    return errors;
}