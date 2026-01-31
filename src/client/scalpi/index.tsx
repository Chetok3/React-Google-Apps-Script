import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

import './styles.css';
import { Provider } from './provider';

ReactDOM.createRoot(document.getElementById('index')!).render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>
);
