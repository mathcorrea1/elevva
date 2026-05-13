export const formatDate = (iso: string): string => {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
};

export const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const now = new Date();
  const diff = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  return beforeBirthday ? diff - 1 : diff;
};

export const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  if (name.length <= 2) return `**@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
};

export const greetingByHour = (name: string): string => {
  const hour = new Date().getHours();
  if (hour < 12) return `Bom dia, ${name}!`;
  if (hour < 18) return `Boa tarde, ${name}!`;
  return `Boa noite, ${name}!`;
};

export const sanitizeText = (value: string): string => value.replace(/[<>]/g, '').trim();
