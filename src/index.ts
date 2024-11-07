import express from 'express';
import "dotenv/config";
import "./db";

const app = express();

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});