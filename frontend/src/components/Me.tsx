import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearUser } from '../features/userSlice';
import api from '../apiService';
import { RootState } from '../store';
import axios from 'axios';
import moment from 'moment';
import StringAvatar from './StringAvatar';

import { IFile } from '../interfaces/file';
import { IUser } from '../interfaces/user';

import { Modal, Box, TextField, ListItemIcon } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import MoreVertIcon from '@mui/icons-material/MoreVert'; 
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';

import ShareModal from './ShareModal';

import './style.css';

// Style for the modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const Me: React.FC = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [fileName, setFileName] = useState('');

  let user: IUser | null = null;

  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      user = JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error parsing userData from localStorage:', error);
  }

  // +-------+
  // | Mount |
  // +-------+

  const fetchFiles = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/files');
        const formattedFiles = response.data.map((file: IFile) => ({
          ...file,
          size: (file.size / 1024).toFixed(2), // Convert size to KBs and fix to 2 decimal places
          uploadDate: moment(file.uploadDate).fromNow(), // Format upload date using moment
        }));
        setFiles(formattedFiles);
      } catch (err) {
        console.error('Failed to fetch files', err);
      }
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // +----------------+
  // | File dropdowns |
  // +----------------+
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);
  const [openMenuFileId, setOpenMenuFileId] = useState<number | null>(null);
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, fileId: number) => {
    setAnchorElMenu(event.currentTarget);
    setOpenMenuFileId(fileId);
  };
  
  const handleMenuClose = () => {
    setAnchorElMenu(null);
    setOpenMenuFileId(null);
  };

  // +--------------+
  // | Upload modal |
  // +--------------+

  const [openModal, setOpenModal] = useState(false);
  const open = Boolean(anchorEl);

  const [files, setFiles] = useState<IFile[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadFile(event.target.files[0]);
      setSelectedFileName(event.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('name', fileName);

    try {
      await api.post('/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      handleCloseModal();
      await fetchFiles();
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  // +---------+
  // | Actions |
  // +---------+

  const downloadFile = (file: IFile) => {
    if (file) {
      alert(JSON.stringify(file));
      const s3 = "https://nimusco-files.s3.us-east-2.amazonaws.com/";
      window.open(s3 + file.path, '_blank');
    }
    handleMenuClose();
  };  

  // +-------------+
  // | Share modal |
  // +-------------+

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState<IFile | null>(null);
  
  const handleOpenShareModal = (file: IFile) => {
    setFileToShare(file);
    setIsShareModalOpen(true);
    handleMenuClose();
  };
  
  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setFileToShare(null);
  };

  // Logout

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            File Manager
          </Typography>
          <div>
            <Button
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Typography variant="subtitle1" component="span" sx={{ marginRight: 1 }}>
                {user?.username}
              </Typography>
              <StringAvatar string={user?.username || "?"} sx={{ width: 28, height: 28, marginRight: 1 }}/>
            </Button>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      
      <Button
        variant="contained"
        sx={{ margin: 2 }}
        onClick={handleOpenModal}
        startIcon={<CloudUploadIcon />}
      >
        Upload File
      </Button>
      
       {/* Modal for file upload */}
       
       <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Upload File
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            name="fileName"
            label="File Name"
            type="text"
            id="fileName"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          <Button
            variant="contained"
            component="label"
            sx={{ mt: 2, display: 'block' }}
          >
            Select File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {selectedFileName && (
            <Typography sx={{ mt: 2 }}>
              Selected file: {selectedFileName}
            </Typography>
          )}
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleUpload}
          >
            Upload
          </Button>
        </Box>
      </Modal>
          
      <ShareModal
        open={isShareModalOpen}
        onClose={handleCloseShareModal}
        file={fileToShare}
      />

      <TableContainer component={Paper} sx={{ maxWidth: 800, margin: 'auto' }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell align="right">Uploaded</TableCell>
              <TableCell align="right">Shared</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>{file.name}</TableCell>
              <TableCell align="left">{`${file.size} KB`}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                  <StringAvatar string={file.owner.username} sx={{ width: 24, height: 24, fontSize: 14, marginRight: 1 }}/>
                  {file.owner.username === user?.username ? "You" : file.owner.username}
                </Box>
              </TableCell>
              <TableCell align="right">{file.uploadDate}</TableCell>
              <TableCell align="right">
                <Chip 
                  icon={<VisibilityIcon />}
                  label={file.total_shared || 0}
                  size="small"
                  color={file.total_shared > 0 && file.owner.username == user?.username ? "primary" : "default"}
                />
              </TableCell>
              <TableCell align="right">
                <IconButton
                  aria-label="more"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  onClick={(event) => handleMenuClick(event, file.id)}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id="file-menu"
                  anchorEl={anchorElMenu}
                  keepMounted
                  open={Boolean(anchorElMenu) && openMenuFileId === file.id}
                  onClose={handleMenuClose}
                >
                  {user?.id === file.owner.userId && (
                    <>
                      <MenuItem onClick={() => handleOpenShareModal(file)}>
                        <ListItemIcon>
                          <ShareIcon fontSize="small" />
                        </ListItemIcon>
                        Share
                      </MenuItem>
                      <MenuItem onClick={handleMenuClose} divider>
                        <ListItemIcon>
                          <EditIcon fontSize="small" />
                        </ListItemIcon>
                        Rename
                      </MenuItem>
                      <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon>
                          <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        Delete
                      </MenuItem>
                    </>
                  )}
                  <MenuItem onClick={() => downloadFile(file)}>
                    <ListItemIcon>
                      <DownloadIcon fontSize="small" />
                    </ListItemIcon>
                    Download
                  </MenuItem>
                </Menu>
              </TableCell>
            </TableRow>
          ))}
          </TableBody>

        </Table>
      </TableContainer>
    </div>
  );
};

export default Me;
