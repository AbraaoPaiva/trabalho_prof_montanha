import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import * as React from 'react';
// material-ui
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Button, FormHelperText, Grid, TextField, useMediaQuery, Alert, Snackbar } from '@mui/material';
import * as Yup from 'yup';
import { Formik } from 'formik';
import useScriptRef from 'hooks/useScriptRef';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { gridSpacing } from 'store/constant';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import MainCard from 'ui-component/cards/MainCard';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

// ===========================|| FIREBASE - REGISTER ||=========================== //

const Ability = ({ ...others }) => {
    const params = useParams();
    const themeButton = createTheme({
        status: {
            danger: '#e53e3e'
        },
        palette: {
            primary: {
                main: '#0971f1',
                darker: '#053e85'
            },
            neutral: {
                main: '#64748B',
                contrastText: '#fff'
            }
        }
    });
    const initialValuesEdit = {
        name: ''
    };
    const theme = useTheme();
    const navigate = useNavigate();
    const [personName, setPersonName] = React.useState([]);
    const scriptedRef = useScriptRef();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [errorValidate, setErrorValidate] = useState({});
    const [valuesEdit, setValuesEdit] = useState(initialValuesEdit);
    const [calcularValor, setCalcularValor] = useState(0);
    const [valorTotal, setValorTotal] = useState(0);
    const names = [
        'Oliver Hansen',
        'Van Henry',
        'April Tucker',
        'Ralph Hubbard',
        'Omar Alexander',
        'Carlos Abbott',
        'Miriam Wagner',
        'Bradley Wilkerson',
        'Virginia Andrews',
        'Kelly Snyder'
    ];
    const titlePage =
        params.action === 'view' ? 'Visualização de Comanda' : params.action === 'edit' ? 'Edição de Comanda' : 'Cadastro de Comanda';
    const isDisabled = params.action === 'view' ? true : false;
    const handleOptionPeople = (event) => {
        const {
            target: { value }
        } = event;
        setPersonName(typeof value === 'string' ? value.split(',') : value);
        setValorTotal(Math.round(calcularValor / (personName.length + 1)));
    };
    return (
        <>
            <Formik
                initialValues={{
                    name: valuesEdit.name,
                    submit: null
                }}
                enableReinitialize
                validationSchema={Yup.object().shape({
                    name: Yup.string().max(255).trim().required('Nome obrigatório'),
                    valor: Yup.string().max(255).trim().required('Valor da comanda é obrigatório'),
                    description: Yup.string().max(255).trim().required('Descrição é obrigatória'),
                    local: Yup.string().max(255).trim().required('Local é obrigatório')
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting, resetForm }) => {
                    try {
                        if (scriptedRef.current) {
                            setStatus({ success: true });
                            setSubmitting(false);
                        }
                        setLoading(true);
                        const data = new FormData();
                        data.append('name', values.name);
                        if (params.action === 'edit') {
                            data.append('_method', 'put');
                            updateAbility(params.id, data, {
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                            })
                                .then((resp) => {
                                    setError('');
                                    setLoading(false);
                                    viewPerId();
                                    setSuccess(resp.data.success);
                                    setTimeout(() => {
                                        navigate('/habilidades');
                                    }, 3000);
                                })
                                .catch((e) => {
                                    setLoading(false);
                                    setSuccess('');
                                    setError(e.response.data.error);
                                });
                        } else {
                            postAbility(data, {
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                            })
                                .then((resp) => {
                                    setError('');
                                    setLoading(false);
                                    setSuccess(resp.data.success);
                                    setTimeout(() => {
                                        navigate('/habilidades');
                                    }, 1500);
                                })
                                .catch((e) => {
                                    setLoading(false);
                                    setSuccess('');
                                    setErrorValidate(e.response.data.errorValidate.file[0]);
                                    setError(e.response.data.error);
                                });
                        }
                    } catch (err) {
                        console.error(err);
                        if (scriptedRef.current) {
                            setStatus({ success: false });
                            setErrors({ submit: err.message });
                            setSubmitting(false);
                        }
                    }
                }}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
                    <>
                        <MainCard spacing={gridSpacing} style={{ padding: 15, margin: 25 }}>
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
                                <form noValidate onSubmit={handleSubmit} {...others}>
                                    <h3>{titlePage}</h3>
                                    <hr></hr>
                                    <Grid container spacing={matchDownSM ? 2 : 2}>
                                        <Grid item xs={12} sm={6} sx={{ marginTop: 3 }}>
                                            <TextField
                                                fullWidth
                                                error={Boolean(touched.name && errors.name) || Boolean(errorValidate.name)}
                                                id="name"
                                                type="text"
                                                label="Nome da comanda"
                                                value={values.name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                name="name"
                                                disabled={isDisabled}
                                                helperText={
                                                    touched.name && errors.name ? errors.name : errorValidate.name ? errorValidate.name : ''
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} sx={{ marginTop: 3 }}>
                                            <TextField
                                                fullWidth
                                                error={Boolean(touched.valor && errors.valor) || Boolean(errorValidate.valor)}
                                                id="valor"
                                                type="number"
                                                label="Valor da comanda"
                                                value={values.valor}
                                                onChange={(e) => setCalcularValor(e.target.value)}
                                                onBlur={handleBlur}
                                                name="name"
                                                disabled={isDisabled}
                                                helperText={
                                                    touched.valor && errors.valor
                                                        ? errors.valor
                                                        : errorValidate.valor
                                                        ? errorValidate.valor
                                                        : ''
                                                }
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={matchDownSM ? 2 : 2}>
                                        <Grid item xs={12} sm={12} sx={{ marginTop: 4 }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="demo-multiple-checkbox-label">Participantes</InputLabel>
                                                <Select
                                                    labelId="demo-multiple-checkbox-label"
                                                    id="demo-multiple-checkbox"
                                                    multiple
                                                    value={personName}
                                                    onChange={handleOptionPeople}
                                                    input={<OutlinedInput label="Tag" />}
                                                    renderValue={(selected) => selected.join(', ')}
                                                >
                                                    {names.map((name) => (
                                                        <MenuItem key={name} value={name}>
                                                            <Checkbox checked={personName.indexOf(name) > -1} />
                                                            <ListItemText primary={name} />
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={matchDownSM ? 2 : 2}>
                                        <Grid item xs={12} sm={12} sx={{ marginTop: 4 }}>
                                            <TextField
                                                fullWidth
                                                error={Boolean(touched.local && errors.local) || Boolean(errorValidate.local)}
                                                id="local"
                                                type="text"
                                                label="Local da compra"
                                                value={values.local}
                                                onChange={(e) => setCalcularValor(e.target.value)}
                                                onBlur={handleBlur}
                                                name="name"
                                                disabled={isDisabled}
                                                helperText={
                                                    touched.local && errors.local
                                                        ? errors.local
                                                        : errorValidate.local
                                                        ? errorValidate.local
                                                        : ''
                                                }
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={matchDownSM ? 2 : 2}>
                                        <Grid item xs={12} sm={12} sx={{ marginTop: 4 }}>
                                            <TextField
                                                fullWidth
                                                error={
                                                    Boolean(touched.description && errors.description) || Boolean(errorValidate.description)
                                                }
                                                id="description"
                                                type="text"
                                                multiline
                                                rows={4}
                                                label="Descrição da comanda"
                                                value={values.description}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                name="description"
                                                disabled={isDisabled}
                                                helperText={
                                                    touched.description && errors.description
                                                        ? errors.description
                                                        : errorValidate.description
                                                        ? errorValidate.description
                                                        : ''
                                                }
                                            />
                                        </Grid>
                                    </Grid>
                                    <Stack direction="row" spacing={1} sx={{ marginTop: 4 }}>
                                        <Chip label={`Valor total para cada participante: ${valorTotal}`} color="success" />
                                    </Stack>
                                    <Grid container alignItems="end" justifyContent="end" sx={{ mt: 3 }}>
                                        <Grid item>
                                            <Box sx={{ mt: 2, mr: 3 }}>
                                                <ThemeProvider theme={themeButton}>
                                                    <AnimateButton>
                                                        <Button
                                                            disableElevation
                                                            disabled={isSubmitting}
                                                            fullWidth
                                                            size="large"
                                                            type="button"
                                                            variant="contained"
                                                            color="neutral"
                                                            onClick={() => navigate(-1)}
                                                        >
                                                            Voltar
                                                        </Button>
                                                    </AnimateButton>
                                                </ThemeProvider>
                                            </Box>
                                        </Grid>
                                        {params.action === 'view' ? (
                                            <Grid item>
                                                <Box sx={{ mt: 2, mr: 3 }}>
                                                    <AnimateButton>
                                                        <Button
                                                            disableElevation
                                                            // disabled={isSubmitting}
                                                            component={Link}
                                                            to={`/habilidade/${params.id}/edit`}
                                                            fullWidth
                                                            size="large"
                                                            variant="contained"
                                                            color="primary"
                                                        >
                                                            Editar
                                                        </Button>
                                                    </AnimateButton>
                                                </Box>
                                            </Grid>
                                        ) : (
                                            <Grid item>
                                                <Box sx={{ mt: 2, mr: 3 }}>
                                                    <AnimateButton>
                                                        <Button
                                                            disableElevation
                                                            disabled={isSubmitting}
                                                            fullWidth
                                                            size="large"
                                                            type="submit"
                                                            variant="contained"
                                                            color="primary"
                                                        >
                                                            Salvar
                                                        </Button>
                                                    </AnimateButton>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>
                                    {errors.submit && (
                                        <Box sx={{ mt: 3 }}>
                                            <FormHelperText error>{errors.submit}</FormHelperText>
                                        </Box>
                                    )}
                                </form>
                            </div>
                        </MainCard>
                    </>
                )}
            </Formik>
        </>
    );
};

export default Ability;
