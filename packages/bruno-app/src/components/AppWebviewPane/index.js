import { useTranslation } from 'react-i18next';
import React from 'react';
import EmptyAppState from 'components/EmptyAppState';

/**
 * The guest surface shared by the request-level app view and standalone
 * collection apps: the <webview> once its document URL is known, the
 * registration error, or a loading placeholder while the URL resolves.
 */
const AppWebviewPane = ({ src, error, webviewRef }) => {
  const { t } = useTranslation();
  if (src) {
    return (
      <webview
        ref={webviewRef}
        src={src}
        partition="bruno-app-view"
        webpreferences="disableDialogs=true, javascript=yes"
        className="app-webview"
      />
    );
  }
  if (error) {
    return <EmptyAppState title={t('App failed to load')} hint={error} />;
  }
  return <div className="p-4 text-xs opacity-60">{t('Loading app…')}</div>;
};

export default AppWebviewPane;
