import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import 'animate.css';

export default function BasicModal() {
    const [open, setOpen] = React.useState(false);
    return (
        <React.Fragment>
            <Button
            className='animate__animated animate__slown animate__pulse animate__infinite bg-gradient-to-r from-sky-400 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200 transform hover:scale-105 '
             onClick={() => setOpen(true)}>
            Instrucciones
            </Button>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={open}
                onClose={() => setOpen(false)}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Sheet
                    variant="outlined"
                    sx={{ maxWidth: 500, borderRadius: 'md', p: 3, boxShadow: 'lg' }}
                >
                    <ModalClose variant="plain" sx={{ m: 1 }} />
                    <Typography
                        component="h2"
                        id="modal-title"
                        level="h2"
                        textColor="inherit"
                        sx={{ fontWeight: 'lg', mb: 1 }}
                    >
                <h2 className="text-xl font-semibold mb-4 text-indigo-700">Instrucciones</h2>

                    </Typography>
                    <Typography
                        component="h4"
                        id="modal-title"
                        level="h4"
                        textColor="inherit"
                        sx={{ fontWeight: 'lg', mb: 1 }}
                    >
                        <p className="text-lg font-bold text-gray-700">Cómo usar SolveOps:</p>          
                    </Typography>
                    <Typography id="modal-desc" textColor="text.tertiary">
                        <div className="mt-10 bg-indigo-100 rounded-lg p-6 shadow-inner">

                            <ul className="list-disc ml-6 text-gray-600">
                                <li>Edite la matriz de costos en la tabla.</li>
                                <li>Haga clic en "Método Húngaro" o "Método de Vogel" para encontrar una asignación óptima.</li>
                                <li>Verá los resultados y el gráfico de asignaciones en la parte inferior.</li>
                                <li>Puede ver el proceso paso a paso en la sección de "Evolución de la Matriz".</li>
                                <li>Use los botones "Agregar Fila" y "Agregar Columna" para modificar la matriz.</li>
                                <li>Haga clic en "Limpiar" para resetear la aplicación.</li>
                            </ul>
                        </div>
                    </Typography>
                </Sheet>
            </Modal>
        </React.Fragment>
    );
}
