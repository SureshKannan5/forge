import express from 'express';
import { PORT } from './config.mjs';
import authRouter from './routes/auth.mjs';
import modelRouter from './routes/models.mjs';


const app = express();

const BASE_URL = '/api/v1'


app.use(express.static('wwwroot'));



app.use(`${BASE_URL}/auth/`, authRouter);
app.use(`${BASE_URL}/models/`, modelRouter)

app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`))