import '@tabler/core/dist/css/tabler.min.css';
import './style.css'

import { renderHeader } from './components/header';
import { renderFileUpload, initFileUpload } from './components/file-upload';
import { renderResults } from './components/results';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="page">
    <div class="page-wrapper">
      <main class="page-body">
        <div class="container-xl">

          ${renderHeader()}
          ${renderFileUpload()}
          ${renderResults()}

        </div>
      </main>
    </div>
  </div>
`

initFileUpload();