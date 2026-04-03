import 'dotenv/config'; 
import express from 'express';
import connectDB from './configs/db.js';
import cors from 'cors';
import userRouter from './routes/userRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import creditRouter from './routes/creditRoutes';
import { stripeWebhooks } from './controllers/webhooks.js';
const app = express();

await connectDB();

app.post('/api/stripe',express({type: 'application/json'}),
stripeWebhooks)

app.use(cors())
app.use(express.json())

app.get('/', (req, res)=> res.send('Server is Live'))
app.use('/api/users',userRouter)
app.use('/api/chats', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/credit' , creditRouter)
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})