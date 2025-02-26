import { Box, Typography, IconButton } from '@mui/material';
import { Add } from '@mui/icons-material';
import React from 'react';

interface PhotoUploadProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  max?: number;
  label?: string;
}

export default function PhotoUpload({ value, onChange, max = 1, label }: PhotoUploadProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Convert files to base64
    const base64Files = await Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      })
    );

    if (max === 1) {
      onChange(base64Files[0]);
    } else {
      const currentFiles = Array.isArray(value) ? value : [];
      onChange([...currentFiles, ...base64Files].slice(0, max));
    }
  };

  const renderUploadBox = () => (
    <Box
      sx={{
        width: 100,
        height: 100,
        display: 'flex',
        bgcolor:'#EAE9ED',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        borderRadius: 4,
      }}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id={`photo-upload-${label || 'main'}`}
        multiple={max > 1}
      />
      <IconButton component="label" htmlFor={`photo-upload-${label || 'main'}`}>
        <Add sx={{ fontSize: 40 }} />
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography variant="subtitle1" gutterBottom>
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {Array.isArray(value) ? (
          <>
            {value.map((img, index) => (
              <Box
                key={index}
                component="img"
                src={img}
                sx={{
                  width: 150,
                  height: 150,
                  objectFit: 'cover',
                  borderRadius: 1,
                }}
              />
            ))}
            {value.length < max && renderUploadBox()}
          </>
        ) : (
          <>
            {value ? (
              <Box
                component="img"
                src={value}
                sx={{
                  width: 150,
                  height: 150,
                  objectFit: 'cover',
                  borderRadius: 1,
                }}
              />
            ) : (
              renderUploadBox()
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
