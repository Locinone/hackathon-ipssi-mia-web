import { createRoot } from 'react-dom/client';

import { QueryClientProvider } from '@tanstack/react-query';

import App from './App.tsx';
import './index.css';
import queryClient from './store/queryClientStore.ts';

createRoot(document.getElementById('root') as HTMLElement).render(
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>
);
