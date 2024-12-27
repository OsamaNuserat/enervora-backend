import * as fs from 'fs';
import * as path from 'path';
import { createCanvas } from 'canvas';

export function getInitials(name: string): string {
  const names = name.split(' ');
  if (names.length > 1) {
    return names[0][0].toUpperCase() + names[1][0].toUpperCase();
  }
  return (name[0] + (name[1] || '')).toUpperCase();
}

function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export async function generateAvatar(username: string): Promise<string> {
  try {
    const initials = getInitials(username);
    const backgroundColor = getRandomColor();
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');

    // Draw circle with random background color
    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.arc(128, 128, 128, 0, Math.PI * 2);
    ctx.fill();

    // Draw initials
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 128px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 128, 128);

    const filePath = path.join(__dirname, '../../uploads/profile-pictures', `${username}-avatar.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);

    return filePath;
  } catch (error) {
    console.error('Error generating avatar:', error);
    throw new Error('Avatar generation failed');
  }
}