import React from 'react';
import { Avatar, AvatarProps, SxProps, Theme } from '@mui/material';

interface StringAvatarProps {
  string: string;
  sx?: SxProps<Theme>; // Use SxProps type for sx prop
}

const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + (value + i * 64).toString(16)).substr(-2);
  }

  return color;
};

const StringAvatar: React.FC<StringAvatarProps> = ({ string, sx }) => {
  const avatarColor = stringToColor(string);
  const avatarLetter = string ? string[0].toUpperCase() : '?';

  return (
    <Avatar sx={{ bgcolor: avatarColor, fontWeight: "bold", ...sx }}>
      {avatarLetter}
    </Avatar>
  );
};

export default StringAvatar;