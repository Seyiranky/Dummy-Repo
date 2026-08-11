import { useState } from 'react';
import { userApi } from '../../api/userApi';

const ExportDataButton = () => {
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
      <p className="muted">
        Download a copy of everything Isoko Talents holds about your account — your profile, skill
        submissions, gigs, matches, payments, reviews, and messages — as a JSON file.
      </p>
      <button type="button" onClick={handleExport} disabled={exporting}>
        {exporting ? 'Preparing export...' : 'Export my data'}
      </button>
    </div>
  );
};

export default ExportDataButton;
