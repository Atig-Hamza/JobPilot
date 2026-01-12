import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/database.js';
import routes from './src/routes/index.js';
import errorHandler from './src/middlewares/errorHandler.js';
import { AppError } from './src/utils/AppError.js';
import { adminAccountInit } from './src/models/User.js';

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

adminAccountInit();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
