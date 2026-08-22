import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { userApi } from '../../api/userApi';

const ExportDataButton = () => {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await userApi.exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'isoko-talents-my-data.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="settings-divider">
      <p>{t('settings.exportDesc')}</p>
      <button type="button" onClick={handleExport} disabled={exporting}>
        {exporting ? t('settings.exporting') : t('settings.exportButton')}
      </button>
    </div>
  );
};

export default ExportDataButton;
