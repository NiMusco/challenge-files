import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Link,
  Divider,
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
  fetchFiles: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, file, fetchFiles }) => {
  const [username, setUsername] = useState('');
  const [sharedUsers, setSharedUsers] = useState<string[]>([]);

  const handleShare = async () => {
    if (!file || !username.trim()) return;
    setSharedUsers([...sharedUsers, username]);
    setUsername('');
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
  };

  const handleSubmitSharedUsers = async () => {
    if (!file) return;

    try {
      const response = await api.post('/files/share', {
        fileId: file.id,
        users: sharedUsers,
      });

      await fetchFiles();
      onClose();
    } catch (error) {
      console.error('Error submitting shared users:', error);
      alert('Failed to submit shared users.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="share-file-modal-title">
      <DialogTitle id="share-file-modal-title">
        Share <strong>{file?.name}</strong>
      </DialogTitle>
      <DialogContent dividers sx={{ padding: 0 }}>
        <List sx={{ width: '100%' }}>
          {sharedUsers.map((user, index) => (
            <ListItem
              key={index}
              secondaryAction={
                user != file?.owner.username && (
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveUser(index)}
                    sx={{ mr: 0.2 }}
                  >
                    <CloseIcon />
                  </IconButton>
                )
              }
            >
              <StringAvatar string={user} sx={{ mr: 1.5, width: 28, height: 28, fontSize: 16 }}></StringAvatar>
              <ListItemText primary={user} />
              {user === file?.owner.username && <Chip label="OWNER" color="primary" size="small" />}
            </ListItem>
          ))}
        </List>
        <Divider/>
        <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            size="small"
            name="username"
            label="Add username"
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleShare}
            disabled={!username.trim()}
            sx={{mt: 1, height: "40px"}}
          >
            Add
          </Button>
        </Box>

      </DialogContent>
      <DialogActions>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button onClick={onClose}>Discard</Button>
          <Button onClick={handleSubmitSharedUsers}>
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ShareModal;
