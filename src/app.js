// src/app.js
require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error.middleware');
const { requireAuth } = require('./middleware/auth.middleware');

// routes

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const mealsRoutes = require('./routes/meals.routes');
const workoutsRoutes = require('./routes/workouts.routes');
const postsRoutes = require('./routes/posts.routes');
const commentsRoutes = require('./routes/comments.routes');
const supplementsRoutes = require('./routes/supplements.routes');
const ordersRoutes = require('./routes/orders.routes');
const convosRoutes = require('./routes/conversations.routes');
const messagesRoutes = require('./routes/messages.routes');
const pointsRoutes = require('./routes/points.routes');
const challengesRoutes = require('./routes/challenges.routes');
const waterRoutes = require('./routes/water.routes');
const journalRoutes = require('./routes/journal.routes');
const meditationRoutes = require('./routes/meditation.routes');
const therapyChatRouter = require('./routes/therapyChat');
const appointmentsRoutes = require('./routes/appointments.routes');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || '*';

const app = express();

app.set('trust proxy', 1);

// ----- Middleware -----
app.use(helmet());
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// simple rate limiter for public endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // per IP
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use('/api/therapy', therapyChatRouter);
// Optional: serve a static folder for uploaded assets (if you store locally)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ----- Health check -----
app.get('/api/health', (req, res) => res.json({ ok: true, now: new Date().toISOString() }));

// Root landing for API. When a user (or platform) visits `/`, return a friendly message.
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'WellNexus backend is running', docs: '/api/health' });
});



// ----- API routes -----
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/supplements', supplementsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/conversations', convosRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/meditation', meditationRoutes);
app.use('/api/appointments', appointmentsRoutes);

// Catch-all for unknown API routes
app.all('/api/*', (req, res) => res.status(404).json({ message: 'API endpoint not found' }));


app.use(errorHandler);

async function seedOnStartup() {
  try {
    const Challenge = require('./models/Challenge');
    const challengeCount = await Challenge.countDocuments();
    if (challengeCount === 0) {
      const now = new Date();
      const end = new Date();
      end.setDate(now.getDate() + 30);
      await Challenge.insertMany([
        {
          title: "7-Day Water Habit",
          description: "Drink at least 2500ml of water every day for a week to earn 200 points!",
          startAt: now,
          endAt: end,
          rules: { target: 2500, type: 'water' },
          participantsCount: 15
        },
        {
          title: "HIIT Sweeper",
          description: "Complete 5 HIIT workouts within 10 days to burn fat and build stamina. Worth 500 points!",
          startAt: now,
          endAt: end,
          rules: { target: 5, type: 'workouts' },
          participantsCount: 24
        },
        {
          title: "Mindfulness Master",
          description: "Meditate for 10 minutes daily. Achieve inner peace and earn 300 points.",
          startAt: now,
          endAt: end,
          rules: { target: 10, type: 'meditation' },
          participantsCount: 8
        }
      ]);
      console.log('[Startup Seed] Created default challenges.');
    }

    const Supplement = require('./models/Supplement');
    const suppCount = await Supplement.countDocuments();
    if (suppCount === 0) {
      await Supplement.insertMany([
        { name: 'Whey Protein 1kg', sku: 'WP-1KG', description: 'Premium whey protein isolate for recovery.', priceCents: 2499, stock: 50, category: 'protein', imageUrl: '' },
        { name: 'Omega-3 Fish Oil', sku: 'OM3-60', description: '1200mg EPA/DHA essential fatty acids.', priceCents: 1599, stock: 30, category: 'omega', imageUrl: '' },
        { name: 'Daily Multivitamin', sku: 'MV-90', description: 'Complete daily nutrients for general wellness.', priceCents: 1299, stock: 45, category: 'general', imageUrl: '' },
        { name: 'Creatine Monohydrate', sku: 'CM-300G', description: 'Pure creatine for strength and performance.', priceCents: 1899, stock: 40, category: 'strength', imageUrl: '' }
      ]);
      console.log('[Startup Seed] Created default supplements.');
    }
  } catch (err) {
    console.error('[Startup Seed] Error:', err);
  }
}

// ----- Start server with DB and Socket.IO -----
let server;
async function start() {
  try {
    await connectDB();
    await seedOnStartup();

    // create HTTP server & Socket.IO
    server = http.createServer(app);

    // Lazy require to avoid bringing socket in tests or non-socket setups
    const { Server } = require('socket.io');
    const io = new Server(server, {
      cors: {
        origin: CLIENT_URL === '*' ? '*' : CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000
    });

    // Basic Socket.IO auth middleware (expects token in query or auth)
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) return next(); // allow anonymous sockets for public features if you want
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = payload.id;
        return next();
      } catch (err) {
        // if you want to reject unauthenticated sockets: return next(new Error('auth error'));
        return next();
      }
    });

    // Socket.IO namespaces or simple connection
    io.on('connection', (socket) => {
      console.log('socket connected', socket.id, 'userId=', socket.userId || 'anon');

      // join room for a conversation
      socket.on('join:conversation', async ({ conversationId }) => {
        if (!conversationId) return;
        socket.join(`convo:${conversationId}`);
      });

      // handle send message event
      socket.on('message:send', async (payload) => {
        // payload: { conversationId, content, attachments, role }
        try {
          const { conversationId, content, attachments, role } = payload || {};
          if (!conversationId || !content) return;

          // verify conversation exists
          const convo = await Conversation.findById(conversationId);
          if (!convo) {
            return socket.emit('message:error', { message: 'Conversation not found' });
          }

          // create message document (sender may be undefined for bots; prefer server verification)
          const msgDoc = new Message({
            conversation: conversationId,
            sender: socket.userId || null,
            role: role || (socket.userId ? 'user' : 'bot'),
            content,
            attachments: attachments || []
          });
          await msgDoc.save();

          // update convo lastMessageAt
          convo.lastMessageAt = new Date();
          await convo.save();

          // broadcast to room
          io.to(`convo:${conversationId}`).emit('message:received', {
            _id: msgDoc._id,
            conversation: msgDoc.conversation,
            sender: msgDoc.sender,
            role: msgDoc.role,
            content: msgDoc.content,
            attachments: msgDoc.attachments,
            createdAt: msgDoc.createdAt
          });
        } catch (err) {
          console.error('socket message error', err);
          socket.emit('message:error', { message: 'Failed to send message' });
        }
      });

      socket.on('disconnect', (reason) => {
        // optional cleanup
      });
    });

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    // graceful shutdown handlers
    const shutdown = async () => {
      console.log('Shutting down server...');
      try {
        io.close();
        server.close(() => {
          console.log('HTTP server closed');
          // close mongoose connection
          const mongoose = require('mongoose');
          mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
          });
        });
      } catch (err) {
        console.error('Error during shutdown', err);
        process.exit(1);
      }
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // expose io for tests and other modules if needed
    app.set('io', io);
  } catch (err) {
    console.error('Failed to start app', err);
    process.exit(1);
  }
}

// If run directly, start server
if (require.main === module) start();

// Export app and start function (useful for tests)
module.exports = { app, start };
