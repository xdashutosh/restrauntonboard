import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Upload,
  FileUpload,
  InsertDriveFile,
  CloudUpload
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axiosInstance from '../interceptor/axiosInstance';

// Styled components
const UploadArea = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  border: `2px dashed ${theme.palette.grey[300]}`,
  backgroundColor: theme.palette.grey[50],
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  }
}));

const HiddenInput = styled('input')({
  display: 'none',
});

const FileDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  width: '100%'
}));

// Define props for the component
interface ImportBulkProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outletId?: number;
}

const ImportBulk: React.FC<ImportBulkProps> = ({ 
  open, 
  onOpenChange, 
  outletId,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Check if the file is an Excel file
      const file = files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        setSelectedFile(file);
      } else {
        showToast('Please select an Excel file (.xlsx or .xls)', 'error');
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !outletId) {
      showToast(
        selectedFile ? "Missing outlet ID" : "Please select a file first",
        'error'
      );
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      await axiosInstance.delete(`/bulkdeletedish/${outletId}`);
      const response = await axiosInstance.post(`/itemupload/${outletId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 1) {
        showToast('Items imported successfully', 'success');
        window.location.reload();
        // Close the dialog and reset state
        setSelectedFile(null);
        onOpenChange(false);
      } else {
        throw new Error(response.data.message || "Failed to import items");
      }
    } catch (error: any) {
      showToast(error.message || "Something went wrong", 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    if (!isUploading) {
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Import Menu Items
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload an Excel file (.xlsx or .xls) containing your menu items.
            </Typography>
            
            <UploadArea onClick={handleBrowseClick} elevation={0}>
              <CloudUpload sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              
              <HiddenInput
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              
              {selectedFile ? (
                <FileDisplay>
                  <InsertDriveFile sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="body2" color="text.primary" noWrap>
                    {selectedFile.name}
                  </Typography>
                </FileDisplay>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Drag and drop your Excel file here, or click the button below
                </Typography>
              )}
              
              <Button 
                variant="outlined" 
                startIcon={<FileUpload />}
                sx={{ mt: 2 }}
              >
                Browse Files
              </Button>
            </UploadArea>
            
            {selectedFile && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Selected file: <strong>{selectedFile.name}</strong>
              </Typography>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            startIcon={isUploading ? <CircularProgress size={16} /> : <Upload />}
            sx={{ 
              bgcolor: 'success.main',
              '&:hover': { bgcolor: 'success.dark' }
            }}
          >
            {isUploading ? 'Uploading...' : 'Upload Items'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ImportBulk;