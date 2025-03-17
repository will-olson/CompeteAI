import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  Container 
} from '@mui/material';

const Navbar = ({ children }) => {
  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={0}
      sx={{ 
        backgroundColor: 'transparent', 
        mb: 2 
      }}
    >
      <Container maxWidth="lg">
        <Toolbar 
          disableGutters
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex',           // Change to flex
              flexDirection: 'row',      // Ensure row direction
              justifyContent: 'center',  // Center horizontally
              alignItems: 'center',      // Center vertically
              gap: 2,                    // Space between items
              width: '100%',             // Full width
              flexWrap: 'wrap'           // Allow wrapping on small screens
            }}
          >
            {children}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;