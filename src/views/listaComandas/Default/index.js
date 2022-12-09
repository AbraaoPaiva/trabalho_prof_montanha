import { useState } from 'react';
import * as React from 'react';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Alert, Snackbar } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import ListaComandas from '../../../ui-component/table';
// ===========================|| FIREBASE - REGISTER ||=========================== //

const MinhasComandas = ({ ...others }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const titlePage = 'Minhas comandas';

    return (
        <MainCard spacing={2} style={{ padding: 15, margin: 25 }}>
            {error || alert ? (
                <Snackbar open={true} autoHideDuration={6000}>
                    <Alert
                        severity={error ? 'error' : success ? 'success' : ''}
                        sx={{
                            width: '100%',
                            backgroundColor: error ? 'red' : success ? 'green' : 'orange',
                            color: '#FFF'
                        }}
                    >
                        {error ? error : success ? success : ''}
                    </Alert>
                </Snackbar>
            ) : (
                ''
            )}
            <div style={{ display: loading ? 'none' : 'block' }}>
                <h3>{titlePage}</h3>
                <hr></hr>
            </div>
            <ListaComandas />
        </MainCard>
    );
};

export default MinhasComandas;
