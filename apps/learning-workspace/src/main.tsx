import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@ilp/design-tokens/styles.css';
import '@ilp/shared-ui/styles.css';
import './styles.css';
import { LearningApp } from './LearningApp';

const root = document.querySelector<HTMLDivElement>('#root');

if (!root) {
  throw new Error('Không tìm thấy phần tử #root để khởi tạo Learning Workspace.');
}

createRoot(root).render(
  <StrictMode>
    <LearningApp />
  </StrictMode>,
);
