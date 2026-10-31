(() => {
  'use strict';

  const cards = [...document.querySelectorAll('.day4-card[data-card-id]')];
  const dialog = document.querySelector('#day4-card-dialog');
  const dialogImage = dialog?.querySelector('img');
  const dialogTitle = dialog?.querySelector('#dialog-title');
  const dialogDownload = dialog?.querySelector('[data-dialog-download]');
  const summary = document.querySelector('[data-asset-summary]');
  let returnFocus = null;

  const updateAssetSummary = () => {
    const pending = cards.filter(card => card.dataset.imageState === 'pending').length;
    const checking = cards.filter(card => card.dataset.imageState === 'checking').length;
    if (!summary || checking > 0) return;
    if (pending === 0) {
      summary.textContent = '7 張圖卡圖片已可查看、放大與下載原圖。';
      summary.dataset.ready = 'true';
    } else {
      summary.textContent = `目前 ${pending} 張圖片待加入；純文字摘要與原課連結可先使用。`;
      summary.dataset.ready = 'false';
    }
  };

  cards.forEach(card => {
    const image = card.querySelector('.card-image-button img');
    const openButton = card.querySelector('[data-card-open]');
    if (!image || !openButton) return;

    const markReady = () => {
      card.dataset.imageState = 'ready';
      openButton.disabled = false;
      updateAssetSummary();
    };
    const markPending = () => {
      card.dataset.imageState = 'pending';
      openButton.disabled = true;
      updateAssetSummary();
    };

    image.addEventListener('load', markReady, { once: true });
    image.addEventListener('error', markPending, { once: true });
    if (image.complete) {
      image.naturalWidth > 0 ? markReady() : markPending();
    }
  });

  const closeDialog = () => {
    if (dialog?.open) dialog.close();
  };

  document.addEventListener('click', event => {
    const openButton = event.target.closest('[data-card-open]');
    if (!openButton || openButton.disabled || !dialog || !dialogImage || !dialogTitle || !dialogDownload) return;

    returnFocus = openButton;
    const source = openButton.dataset.cardOpen;
    const title = openButton.dataset.cardTitle;
    dialogImage.src = source;
    dialogImage.alt = `${title}放大圖卡`;
    dialogTitle.textContent = title;
    dialogDownload.href = source;
    dialogDownload.setAttribute('download', '');
    dialog.showModal();
    dialog.querySelector('[data-dialog-close]')?.focus();
  });

  dialog?.querySelector('[data-dialog-close]')?.addEventListener('click', closeDialog);
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });
  dialog?.addEventListener('cancel', event => {
    event.preventDefault();
    closeDialog();
  });
  dialog?.addEventListener('close', () => {
    dialogImage?.removeAttribute('src');
    if (returnFocus?.isConnected) returnFocus.focus();
    returnFocus = null;
  });
})();
