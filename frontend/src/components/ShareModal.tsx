import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../apiService';
import { IFile } from '../interfaces/file';
import StringAvatar from './StringAvatar';

// Props interface
interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  file: IFile | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, file }) => {
  const [username, setUsername] = useState('');
  const [sharedUsers, setSharedUsers] = useState<string[]>([]);

  const handleShare = async () => {
    if (!file || !username.trim()) return;
    setSharedUsers([...sharedUsers, username]);
    setUsername(''); // Clear the input field
    // Mock success message
    alert('User added to shared list!');
  };

  useEffect(() => {
    const fetchSharedUsers = async () => {
      if (file && open) {
        try {
          const response = await api.get(`/files/share/${file.id}`);
          setSharedUsers(response.data); // Assuming the API returns an array of usernames
        } catch (error) {
          console.error('Error fetching shared users:', error);
          setSharedUsers([]); // Reset on error or no data
        }
      }
    };

    fetchSharedUsers();
  }, [file, open]);

  const handleRemoveUser = (index: number) => {
    const updatedSharedUsers = sharedUsers.filter((_, idx) => idx !== index);
    setSharedUsers(updatedSharedUsers);
    // Mock removal message
    alert('User removed from shared list!');
  };

  const handleSubmitSharedUsers = async () => {
    if (!file) return;

    try {
      const response = await api.post('/files/share', {
        fileId: file.id,
        users: sharedUsers,
      });

      alert(JSON.stringify(response.data));
      alert('Shared users submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting shared users:', error);
      alert('Failed to submit shared users.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="share-file-modal-title"
      aria-describedby="share-file-modal-description"
    >
      <Box sx={{
        width: 400,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
      }}>
        <Typography id="share-file-modal-title" variant="h6" component="h2">
          Share <strong>{file?.name}</strong> with:
        </Typography>

        <List sx={{ width: '100%', bgcolor: 'background.paper', mt: 2 }}>
          {sharedUsers.map((user, index) => (
            <ListItem
              key={index}
              secondaryAction={
                user != file?.owner.username && (
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveUser(index)}>
                    <CloseIcon />
                  </IconButton>
                )
              }
            >
              <StringAvatar string={user} sx={{ mr: 1.5, width: 28, height: 28, fontSize: 16 }}></StringAvatar>
              <ListItemText primary={user} />
              
              {user === file?.owner.username && (
                <Chip label="OWNER" color="primary" size="small" />
              )}
            </ListItem>
          ))}
        </List>

        <TextField
          margin="normal"
          required
          fullWidth
          name="username"
          label="Add User by Username"
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'space-between', // This spreads the children across the main axis
          }}
        >
          <Button
            variant="contained"
            onClick={handleShare}
            disabled={!username.trim()}
          >
            Add User
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSubmitSharedUsers()}
          >
            Save
          </Button>
        </Box>


      </Box>
    </Modal>
  );
};

export default ShareModal;
