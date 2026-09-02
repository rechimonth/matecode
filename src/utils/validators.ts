export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: "La contraseña debe tener al menos 6 caracteres" };
  }
  return { valid: true };
};

export const validateTaskTitle = (title: string): { valid: boolean; message: string } => {
  const value = title.trim();
  if (!value) return { valid: false, message: "El título es requerido" };
  if (value.length > 120) return { valid: false, message: "El título no puede superar los 120 caracteres" };
  return { valid: true, message: "" };
};

export const validateTaskDescription = (description: string): { valid: boolean; message: string } => {
  const value = description.trim();
  if (!value) return { valid: false, message: "La descripción es requerida" };
  if (value.length > 2000) return { valid: false, message: "La descripción no puede superar los 2000 caracteres" };
  return { valid: true, message: "" };
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
};
