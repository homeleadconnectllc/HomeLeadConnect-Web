import { mountLegacyRoute } from './legacyRoute';
import { isPublicHome, publicHomeMarkup } from './routes/publicHome';
import './styles.css';
import './styles/public-frontdoor-reintegration-20260913.css';
import './styles/public-home-v2-20260913.css';
import './styles/public-home-app-reconciliation-20260907.css';
import './styles/frontdoor-login-visual-authority-20260910.css';
import './styles/frontdoor-accessibility-authority-20260907.css';
import './styles/physical-component-root-authority-20260907.css';
import './styles/runtime-physical-authority-20260907.css';
import './styles/runtime-portal-authority-20260907.css';
import './styles/board-login-authority-20260912.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

if (isPublicHome) {
  rootElement.innerHTML = publicHomeMarkup();
} else {
  mountLegacyRoute(rootElement);
}
