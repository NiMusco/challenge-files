import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import api from '../apiService';
import { IFile } from '../interfaces/file';

// Props interface
interface RenameModalProps {
  open: boolean;
  onClose: () => void;
  file: IFile | null;
  fetchFiles: () => void;
}

const RenameModal: React.FC<RenameModalProps> = ({ open, onClose, file, fetchFiles }) => {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (file && open) {
      setNewName(file.name);
    }
  }, [file, open]);

  const handleRename = async () => {
    if (!file || !newName.trim()) return;

    try {
      await api.patch(`/files/${file.id}`, { name: newName });
      fetchFiles();
      onClose();
    } catch (error) {
      console.error('Error renaming file:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="rename-file-modal-title">
      <DialogTitle id="rename-file-modal-title">Rename File</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="File name"
          type="text"
          fullWidth
          variant="standard"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleRename}>Rename</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameModal;