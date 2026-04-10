import Popup from './App';
import { t } from '@/shared/i18n/i18n';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';

document.title = t('appName');
createRoot(document.getElementById('app')!).render(<Popup />);
