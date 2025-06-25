import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';


const theme = createTheme({
  palette: {
    primary: {
      main: '#D97500', // Orange from Landing page
    },
    secondary: {
      main: '#D97500', // Orange for buttons and avatar
    },
    text: {
      primary: '#ffffff', // White text for consistency
      secondary: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px', // Match getStartedButton's rounded corners
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '1rem',
          padding: '0.8rem 1.6rem',
          whiteSpace: 'nowrap',
          minWidth: '100px',
          '&.MuiButton-contained': {
            backgroundColor: '#D97500',
            color: '#000000', // Black text like getStartedButton
            '&:hover': {
              backgroundColor: '#b36200', // Slightly darker orange for hover
            },
          },
          '&.MuiButton-outlined': {
            borderColor: '#D97500',
            color: '#D97500',
            '&:hover': {
              backgroundColor: 'rgba(217, 117, 0, 0.04)',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white for readability
            '& fieldset': {
              borderColor: '#D97500',
            },
            '&:hover fieldset': {
              borderColor: '#b36200',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#D97500',
            },
          },
          '& .MuiInputBase-input': {
            color: '#000000', // Black input text
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#ffffff', // White text to match Landing page
        },
      },
    },
  },
});

export default function Authentication() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
        navigate('/dashboard');
      }
      if (formState === 1) {
        const result = await handleRegister(name, username, password);
        setMessage(result);
        setOpen(true);
        setError('');
        setFormState(0);
        setUsername('');
        setPassword('');
        setName('');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'An error occurred';
      setError(message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'url("/background.png") no-repeat center/cover', // Match Landing page background
          padding: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            maxWidth: 400,
            width: '100%',
            padding: 4,
            borderRadius: 3,
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black for contrast
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" fontWeight={500} sx={{ fontSize: '2rem' }}>
              {formState === 0 ? 'Sign In' : 'Sign Up'}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant={formState === 0 ? 'contained' : 'outlined'}
                onClick={() => setFormState(0)}
                sx={{ flex: 1 }}
              >
                Sign In
              </Button>
              <Button
                variant={formState === 1 ? 'contained' : 'outlined'}
                onClick={() => setFormState(1)}
                sx={{ flex: 1 }}
              >
                Sign Up
              </Button>
            </Box>
            <Box component="form" noValidate sx={{ mt: 3, width: '100%' }}>
              {formState === 1 && (
                <>
                  <Typography
                    variant="body1"
                    sx={{ color: '#000000', fontSize: '1.1rem', mb: 0.5 }}
                  >
                    Full Name *
                  </Typography>
                  <label>Name</label>
                  <TextField
                    margin="none"
                    required
                    fullWidth
                    id="name"
                    name="name"
                    value={name}
                    autoFocus
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                  />
                </>
              )}
              <Typography
                variant="body1"
                sx={{ color: '#000000', fontSize: '1.1rem', mb: 0.5, mt: formState === 1 ? 1 : 0 }}
              >
                Username *
              </Typography>
              <label>Username</label>
              <TextField
                margin="none"
                required
                fullWidth
                id="username"
                name="username"
                value={username}
                autoFocus={formState === 0}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
              />
              <Typography
                variant="body1"
                sx={{ color: '#000000', fontSize: '1.1rem', mb: 0.5, mt: 1 }}
              >
                Password *
              </Typography>
              <label>Password</label>
              <TextField
                margin="none"
                required
                fullWidth
                name="password"
                value={password}
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
              />
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1, color: '#ff6b6b' }}>
                  {error}
                </Typography>
              )}
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1 }}
                onClick={handleAuth}
              >
                {formState === 0 ? 'Log In' : 'Register'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </ThemeProvider>
  );
}