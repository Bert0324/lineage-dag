'use strict';

import { t } from "../example/utils/i18n";

export const actions = [
  {
    key: 'zoom-in',
    icon: 'table-build-icon table-build-icon-zoom-in',
    title: t('zoomIn'),
    onClick: (canvas) => {
      canvas.zoom(canvas._zoomData + 0.1);
    }
  },
  {
    key: 'zoom-out',
    icon: 'table-build-icon table-build-icon-zoom-out',
    title: t('zoomOut'),
    onClick: (canvas) => {
      canvas.zoom(canvas._zoomData - 0.1);
    }
  },
  {
    key: 'fit',
    icon: 'table-build-icon table-build-icon-quanping2',
    title: t('center'),
    onClick: (canvas) => {
      canvas.focusCenterWithAnimate(undefined, () => {
        console.log('complete!!!')
      });
    }
  }
];
