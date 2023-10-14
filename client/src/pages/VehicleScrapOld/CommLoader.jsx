import React from 'react'
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const CommLoader = () => {
    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CircularProgress />
            </Box>
        </>
    )
}

export default CommLoader