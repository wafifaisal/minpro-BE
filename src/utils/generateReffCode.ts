import { v4 as uuidv4 } from 'uuid';

export function generateReferralCode(firstName: string): string {
  const namePart = firstName.slice(0, 4).toUpperCase().padEnd(4, 'X');
  const uuidPart = uuidv4().split('-')[0].slice(0, 4).toUpperCase();
  return `${namePart}${uuidPart}`;
}
