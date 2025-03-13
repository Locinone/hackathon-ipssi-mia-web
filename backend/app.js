// Montage des routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/notifications', notificationRoutes); 