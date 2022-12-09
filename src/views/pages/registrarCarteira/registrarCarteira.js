import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    OutlinedInput,
    TextField,
    useMediaQuery,
    MenuItem,
    Select,
    Alert,
    ListItemText,
    Snackbar
} from '@mui/material';

import * as Yup from 'yup';
import { Formik } from 'formik';
import useScriptRef from 'hooks/useScriptRef';
import AnimateButton from 'ui-component/extended/AnimateButton';

import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';

// ===========================|| FIREBASE - REGISTER ||=========================== //

const RegistrarCarteira = ({ ...others }) => {
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
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250
            }
        }
    };
    const initialStateOptions = {
        competences: [],
        speakers: [],
        skills: []
    };
    const initialValuesEdit = {
        name: '',
        description: EditorState.createEmpty(),
        file: '',
        speaker: [],
        competence: [],
        skill: [],
        schedulingPost: null,
        schedulingTimeline: null
    };

    const theme = useTheme();
    const navigate = useNavigate();
    const scriptedRef = useScriptRef();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
    const [options, setOptions] = useState(initialStateOptions);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [errorValidate, setErrorValidate] = useState({});
    const [valuesEdit, setValuesEdit] = useState(initialValuesEdit);

    const titlePage =
        params.action === 'view' ? 'Visualização de Curso' : params.action === 'edit' ? 'Edição de Curso' : 'Cadastro de Curso';
    const isDisabled = params.action === 'view' ? true : false;

    return (
        <>
            <Formik
                initialValues={{
                    name: valuesEdit.name,
                    description: valuesEdit.description,
                    file: valuesEdit.file,
                    speaker: valuesEdit.speaker || [],
                    competence: valuesEdit.competence || [],
                    skill: valuesEdit.skill || [],
                    submit: null,
                    schedulingPost: valuesEdit.schedulingPost ? new Date(valuesEdit.schedulingPost) : null,
                    schedulingTimeline: valuesEdit.schedulingTimeline ? new Date(valuesEdit.schedulingTimeline) : null,
                    timelineActive: valuesEdit.timelineActive
                }}
                enableReinitialize
                validationSchema={Yup.object().shape({
                    name: Yup.string().max(255).trim().required('Título obrigatório'),
                    speaker: Yup.array().required('Palestrante Obrigatório').min(1, 'Necessário escolher palestrante'),
                    competence: Yup.array().required('Competência Obrigatório').min(1, 'Necessário escolher competência'),
                    schedulingTimeline: Yup.date()
                        .nullable()
                        .min(Yup.ref('schedulingPost'), 'Data de post na timeline não deve ser menor que a data do post')
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting, resetForm }) => {
                    try {
                        if (scriptedRef.current) {
                            setStatus({ success: true });
                            setSubmitting(false);
                        }
                        setLoading(true);
                        let idsSpeaker = getIdsSpeaker(values.speaker);
                        let idsCompetence = getIdsCompetence(values.competence);
                        let arraySpeaker = [];
                        let arrayCompetence = [];

                        for (let i = 0; i < idsSpeaker.length; i++) {
                            arraySpeaker.push(idsSpeaker[i].id);
                        }
                        for (let i = 0; i < idsCompetence.length; i++) {
                            arrayCompetence.push(idsCompetence[i].id);
                        }

                        const skillsIds = getIdsSkills(values.skill).map((item) => item.id);
                        const data = new FormData();

                        data.append(`competence`, JSON.stringify(arrayCompetence));
                        data.append(`speaker`, JSON.stringify(arraySpeaker));
                        data.append(`skill`, JSON.stringify(skillsIds));
                        data.append('name', values.name);
                        data.append('description', `${draftToHtml(convertToRaw(values.description.getCurrentContent()))}`);

                        if (values?.schedulingPost) {
                            data.append('schedulingPost', moment(values?.schedulingPost).format('YYYY-MM-DD HH:mm:ss'));
                        }

                        if (values?.schedulingTimeline) {
                            data.append('schedulingTimeline', moment(values?.schedulingTimeline).format('YYYY-MM-DD HH:mm:ss'));
                        }

                        if (values.file.name) {
                            data.append('file', values.file);
                        }
                        if (params.action === 'edit') {
                            data.append('_method', 'put');
                            updateCourse(params.id, data, {
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                            })
                                .then((resp) => {
                                    setError('');
                                    setLoading(false);
                                    viewPerId();
                                    setSuccess(resp.data.success);
                                    setTimeout(() => {
                                        navigate('/cursos');
                                    }, 3000);
                                })
                                .catch((e) => {
                                    setLoading(false);
                                    setSuccess('');
                                    setError(e.response.data.error || e.response.data.errorValidate.file[0]);
                                });
                        } else {
                            postCourse(data, {
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                            })
                                .then((resp) => {
                                    setError('');
                                    setLoading(false);
                                    setSuccess(resp.data.success);
                                    setTimeout(() => {
                                        navigate('/cursos');
                                    }, 3000);
                                })
                                .catch((e) => {
                                    setLoading(false);
                                    setSuccess('');
                                    //setErrorValidate(e.response.values.errorValidate || 'Somente é aceito arquivos de imagem');
                                    setError(e.response.data.error || e.response.data.errorValidate.file[0]);
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
                        {console.log(values)}
                        {loading && (
                            <Grid container alignItems="center" justifyContent="center">
                                <MainCard style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Loading color="#015641" type="spinningBubbles" />
                                </MainCard>
                            </Grid>
                        )}
                        <MainCard spacing={gridSpacing} style={{ padding: 15, margin: 25 }}>
                            {error || alert || errorValidate ? (
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
                                    <Grid container spacing={matchDownSM ? 0 : 2}>
                                        <Dropzone
                                            onDrop={(e) => setFieldValue('file', e[0])}
                                            style={{ width: '150px', height: '150px', BorderStyle: 'none', border: 0 }}
                                        >
                                            {({ getRootProps, getInputProps }) => (
                                                <div {...getRootProps()}>
                                                    <AvatarEditor
                                                        onPositionChange={''}
                                                        disablecanvasrotation
                                                        width={150}
                                                        height={150}
                                                        image={values.file}
                                                        border={1}
                                                        style={{
                                                            BorderStyle: 'none',
                                                            verticalAlign: 'middle',
                                                            cursor: 'pointer',
                                                            marginBlockStart: '1em',
                                                            marginBlockEnd: '1em',
                                                            marginInlineStart: '40px',
                                                            marginInlineEnd: '40px'
                                                        }}
                                                        // scale={1.2}
                                                        // className="rounded-circle"
                                                    />
                                                    <input {...getInputProps()} />
                                                </div>
                                            )}
                                        </Dropzone>
                                    </Grid>
                                    <Grid container spacing={matchDownSM ? 0 : 2}>
                                        <Grid item xs={12} sm={6} sx={{ marginTop: 3 }}>
                                            <TextField
                                                fullWidth
                                                error={Boolean(touched.name && errors.name) || Boolean(errorValidate.name)}
                                                id="outlined-title"
                                                type="text"
                                                label="Título"
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
                                            <FormControl
                                                sx={{ width: '100%' }}
                                                error={Boolean(touched.speaker && errors.speaker) || Boolean(errorValidate.speaker)}
                                            >
                                                <InputLabel id="speaker">Palestrantes</InputLabel>
                                                <Select
                                                    labelId="speaker"
                                                    onBlur={handleBlur}
                                                    multiple
                                                    name="speaker"
                                                    id="speaker"
                                                    value={values.speaker}
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            'speaker',
                                                            typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                                                        )
                                                    }
                                                    input={<OutlinedInput label="Palestrantes" />}
                                                    renderValue={(selected) => selected.join(', ')}
                                                    MenuProps={MenuProps}
                                                    disabled={isDisabled}
                                                >
                                                    {options.speakers.map((option) => (
                                                        <MenuItem key={option.id} value={option.name}>
                                                            <Checkbox checked={values.speaker.indexOf(option.name) > -1} />
                                                            <ListItemText primary={option.name} />
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errorValidate.speaker && (
                                                    <FormHelperText error id="standard-weight-helper-text--speaker">
                                                        {errorValidate.speaker}
                                                    </FormHelperText>
                                                )}
                                                {touched.speaker && errors.speaker && (
                                                    <FormHelperText error id="standard-weight-helper-text--speaker">
                                                        {errors.speaker}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6} sx={{ marginTop: 3 }}>
                                            <FormControl
                                                sx={{ width: '100%' }}
                                                error={
                                                    Boolean(touched.competence && errors.competence) || Boolean(errorValidate.competence)
                                                }
                                            >
                                                <InputLabel id="skills">Habilidades</InputLabel>
                                                <Select
                                                    labelId="skill"
                                                    onBlur={handleBlur}
                                                    multiple
                                                    name="skill"
                                                    id="skill"
                                                    value={values.skill}
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            'skill',
                                                            typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                                                        )
                                                    }
                                                    input={<OutlinedInput label="Habilidades" />}
                                                    renderValue={(selected) => selected.join(', ')}
                                                    MenuProps={MenuProps}
                                                    disabled={isDisabled}
                                                >
                                                    {options.skills.map((option) => (
                                                        <MenuItem key={option.id} value={option.name}>
                                                            <Checkbox checked={values.skill.indexOf(option.name) > -1} />
                                                            <ListItemText primary={option.name} />
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errorValidate.skill && (
                                                    <FormHelperText error id="standard-weight-helper-text--skill">
                                                        {errorValidate.skill}
                                                    </FormHelperText>
                                                )}
                                                {touched.skill && errors.skill && (
                                                    <FormHelperText error id="standard-weight-helper-text--skill">
                                                        {errors.skill}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6} sx={{ marginTop: 3 }}>
                                            <FormControl
                                                sx={{ width: '100%' }}
                                                error={
                                                    Boolean(touched.competence && errors.competence) || Boolean(errorValidate.competence)
                                                }
                                            >
                                                <InputLabel id="competence">Competências</InputLabel>
                                                <Select
                                                    labelId="competence"
                                                    onBlur={handleBlur}
                                                    multiple
                                                    name="competence"
                                                    id="competence"
                                                    value={values.competence}
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            'competence',
                                                            typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                                                        )
                                                    }
                                                    input={<OutlinedInput label="Competências" />}
                                                    renderValue={(selected) => selected.join(', ')}
                                                    MenuProps={MenuProps}
                                                    disabled={isDisabled}
                                                >
                                                    {options.competences.map((option) => (
                                                        <MenuItem key={option.id} value={option.desription}>
                                                            <Checkbox checked={values.competence.indexOf(option.desription) > -1} />
                                                            <ListItemText primary={option.desription} />
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errorValidate.competence && (
                                                    <FormHelperText error id="standard-weight-helper-text--competence">
                                                        {errorValidate.competence}
                                                    </FormHelperText>
                                                )}
                                                {touched.competence && errors.competence && (
                                                    <FormHelperText error id="standard-weight-helper-text--competence">
                                                        {errors.competence}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        {!valuesEdit?.active && (
                                            <Grid item xs={6} sm={0} sx={{ marginTop: 0 }}>
                                                <SchedulingFormInput
                                                    schedule={values.schedulingPost}
                                                    setSchedule={handleChange}
                                                    id="schedulingPost"
                                                    label="Agendar Publicação de curso"
                                                    minDate={new Date()}
                                                    disabled={params.action === 'view'}
                                                />
                                            </Grid>
                                        )}
                                        {(!valuesEdit?.timelineActive || values.schedulingTimeline) && (
                                            <Grid item xs={6} sm={0} sx={{ marginTop: 0 }}>
                                                <FormControl
                                                    sx={{ width: '100%' }}
                                                    error={
                                                        Boolean(touched?.schedulingTimeline && errors?.schedulingTimeline) ||
                                                        Boolean(errorValidate?.schedulingTimeline)
                                                    }
                                                >
                                                    <SchedulingFormInput
                                                        schedule={values.schedulingTimeline}
                                                        setSchedule={handleChange}
                                                        id="schedulingTimeline"
                                                        label="Agendar Publicação na Timeline"
                                                        minDate={new Date()}
                                                        disabled={params.action === 'view'}
                                                    />

                                                    {errorValidate.schedulingTimeline && (
                                                        <FormHelperText error id="standard-weight-helper-text--schedulingTimeline">
                                                            {errorValidate.schedulingTimeline}
                                                        </FormHelperText>
                                                    )}
                                                    {touched.schedulingTimeline && errors.schedulingTimeline && (
                                                        <FormHelperText error id="standard-weight-helper-text--schedulingTimeline">
                                                            {errors.schedulingTimeline}
                                                        </FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                        )}

                                        <Grid container spacing={matchDownSM ? 0 : 2}>
                                            <Grid item xs={12} sm={12} sx={{ marginTop: 3 }}>
                                                {values.description && (
                                                    <Editor
                                                        editorStyle={{
                                                            height: '200px',
                                                            width: '100%',
                                                            border: '1px solid #DCDCDC',
                                                            borderRadius: '25px',
                                                            padding: '20px'
                                                        }}
                                                        toolbar={{
                                                            options: ['inline', 'list', 'textAlign', 'fontFamily', 'fontSize', 'link'],
                                                            inline: {
                                                                options: ['bold', 'italic', 'underline']
                                                            },
                                                            list: {
                                                                options: ['unordered', 'ordered', 'indent', 'outdent']
                                                            },
                                                            textAlign: {
                                                                options: ['left', 'center', 'right']
                                                            },
                                                            fontFamily: {
                                                                options: [
                                                                    'Arial',
                                                                    'Georgia',
                                                                    'Impact',
                                                                    'Tahoma',
                                                                    'Times New Roman',
                                                                    'Verdana'
                                                                ]
                                                            }
                                                        }}
                                                        editorState={values.description}
                                                        toolbarClassName="toolbarClassName"
                                                        wrapperClassName="wrapperClassName"
                                                        editorClassName="editorClassName"
                                                        onEditorStateChange={(e) => setFieldValue('description', e)}
                                                        disabled={isDisabled}
                                                    />
                                                )}
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid container alignItems="end" justifyContent="end" sx={{ mt: 3 }}>
                                        {params.action === 'edit' && (
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
                                                                onClick={() => navigate(`/nova_aula/${params.id}`)}
                                                            >
                                                                Adicionar aulas
                                                            </Button>
                                                        </AnimateButton>
                                                    </ThemeProvider>
                                                </Box>
                                            </Grid>
                                        )}
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
                                                            to={`/curso/${params.id}/edit`}
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

export default RegistrarCarteira;
