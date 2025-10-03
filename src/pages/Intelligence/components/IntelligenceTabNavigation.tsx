import Icon from '@mdi/react';
import {
  mdiBrain,
  mdiTrendingDown,
  mdiShieldAlert,
  mdiLightbulbOn,
  mdiLightningBolt,
  mdiLink,
} from '@mdi/js';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function IntelligenceTabNavigation({
  activeTab,
  onTabChange,
}: Props) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: mdiBrain },
    { id: 'forecasting', label: 'Forecasting', icon: mdiTrendingDown },
    { id: 'risks', label: 'Risk Analysis', icon: mdiShieldAlert },
    { id: 'actions', label: 'Actions', icon: mdiLightbulbOn },
    { id: 'insights', label: 'Insights', icon: mdiLightningBolt },
    { id: 'integrations', label: 'Integrations', icon: mdiLink },
  ];

  return (
    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '0.5rem',
            background: activeTab === tab.id ? '#eee' : 'white',
            cursor: 'pointer',
            boxShadow:
              activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#374151',
          }}
        >
          <Icon path={tab.icon} size={1} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
