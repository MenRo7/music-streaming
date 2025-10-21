export const calculateAge = (dateOfBirth: string | Date | null | undefined): number | null => {
  if (!dateOfBirth) return null;

  try {
    const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;

    if (isNaN(birthDate.getTime())) {
      return null;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 0 ? age : null;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
};

export const isAdult = (dateOfBirth: string | Date | null | undefined): boolean => {
  const age = calculateAge(dateOfBirth);
  return age !== null && age >= 18;
};

export const isMinor = (dateOfBirth: string | Date | null | undefined): boolean => {
  const age = calculateAge(dateOfBirth);
  return age !== null && age < 18;
};
