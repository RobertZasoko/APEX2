import React, { useState, useEffect, useRef } from 'react';
import { Scenario, UserProfile, SavedScenario } from '../types';
import { HistoryIcon, LogoutIcon, MicIcon, SearchIcon, TrashIcon, LoadingIcon } from './icons/Icons';

interface SetupScreenProps {
  user: UserProfile;
  onStartCall: (scenario: Scenario, audioDeviceId: string) => void;
  onViewHistory: () => void;
  onLogout: () => void;
  onSaveScenario: (scenario: Scenario, name: string) => void;
  onDeleteScenario: (scenarioId: string) => void;
  deletingScenarioId: string | null;
}

const PRESET_SCENARIOS: SavedScenario[] = [
  {
    id: 'preset-1',
    name: 'Tech Startup CEO (Budget)',
    consultantRole: 'Cloud Solutions Architect',
    leadSource: 'Referral',
    clientRole: 'CEO',
    clientPersona: 'Skeptical',
    industry: 'SaaS',
    objectionStyle: 'Budget',
  },
  {
    id: 'preset-2',
    name: 'Manufacturing Manager (Legacy Systems)',
    consultantRole: 'Automation Specialist',
    leadSource: 'Inbound Lead',
    clientRole: 'Operations Manager',
    clientPersona: 'Friendly',
    industry: 'Manufacturing',
    objectionStyle: 'Trust',
  },
  {
    id: 'preset-3',
    name: 'Marketing Director (Needs ROI)',
    consultantRole: 'Digital Marketing Consultant',
    leadSource: 'Cold Email',
    clientRole: 'Marketing Director',
    clientPersona: 'Rushed',
    industry: 'eCommerce',
    objectionStyle: 'No Need',
  },
  {
    id: 'preset-4',
    name: 'HR Director (Existing Vendor)',
    consultantRole: 'HR Software Sales Rep',
    leadSource: 'YouTube DM',
    clientRole: 'HR Director',
    clientPersona: 'Talkative',
    industry: 'Corporate',
    objectionStyle: 'Already working with someone',
  },
];

const CustomSelectField: React.FC<{
  label: string;
  name: keyof Scenario;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}> = ({ label, name, value, options, onChange }) => {
  // Derived state: show the input if the current value is not a preset option.
  const showCustomInput = !options.includes(value);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'custom') {
      // When 'Custom...' is selected, clear the value to show the text input.
      const syntheticEvent = {
        target: { name, value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    } else {
      onChange(e);
    }
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-text-secondary">{label}</label>
      <select
        id={`${name}-select`}
        name={name}
        // If we're showing the custom input, the select should show 'Custom...'.
        // Otherwise, it should show the current value.
        value={showCustomInput ? 'custom' : value}
        onChange={handleSelectChange}
        className="mt-1 block w-full bg-background border border-border rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
      >
        {options.map(option => <option key={option} value={option}>{option}</option>)}
        <option value="custom">Custom...</option>
      </select>
      {showCustomInput && (
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="mt-2 block w-full bg-background border border-border rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
          placeholder="Enter custom value..."
          autoFocus
        />
      )}
    </div>
  );
};

const InputField: React.FC<{
  label: string;
  name: keyof Scenario;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, value, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-text-secondary">{label}</label>
    <input
      type="text"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full bg-background border border-border rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
    />
  </div>
);

const LOCAL_STORAGE_KEY = 'apex-ai-custom-scenario';
const AUDIO_DEVICE_KEY = 'apex-ai-selected-mic';

// Helper to get initial state from localStorage or defaults
const getInitialState = (): { scenario: Scenario, id: string } => {
  try {
    const savedCustomScenarioJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedCustomScenarioJSON) {
      const savedScenario = JSON.parse(savedCustomScenarioJSON);
      // Basic validation to ensure it's a scenario-like object
      if (savedScenario && typeof savedScenario === 'object' && 'consultantRole' in savedScenario) {
        return { scenario: savedScenario, id: '' };
      }
    }
  } catch (error) {
    console.error("Failed to parse scenario from localStorage:", error);
  }

  // Default to the first preset scenario
  const firstPreset = PRESET_SCENARIOS[0];
  return { scenario: { ...firstPreset }, id: firstPreset.id };
};


const SetupScreen: React.FC<SetupScreenProps> = ({ user, onStartCall, onViewHistory, onLogout, onSaveScenario, onDeleteScenario, deletingScenarioId }) => {
  const [initialState] = useState(getInitialState);
  const [scenario, setScenario] = useState<Scenario>(initialState.scenario);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(initialState.id);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [searchQuery, setSearchQuery] = useState('');
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string>('');

  const prevScenariosLength = useRef(user.savedScenarios.length);

  // Effect to get available audio devices
  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          console.warn("enumerateDevices() not supported.");
          return;
        }
        // Ensure permissions are granted before enumerating to get device labels
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
        setAudioDevices(audioInputDevices);

        if (audioInputDevices.length > 0) {
          const savedDeviceId = localStorage.getItem(AUDIO_DEVICE_KEY);
          const deviceExists = audioInputDevices.some(d => d.deviceId === savedDeviceId);
          if (savedDeviceId && deviceExists) {
            setSelectedAudioDeviceId(savedDeviceId);
          } else {
            setSelectedAudioDeviceId(audioInputDevices[0].deviceId);
          }
        }
      } catch (err) {
        console.error("Error getting audio devices:", err);
        // Optionally, inform the user they need to grant microphone permissions
        alert("Could not access microphone. Please grant permission in your browser settings to select an audio device.");
      }
    };
    getAudioDevices();
  }, []);

  const handleAudioDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.target.value;
    setSelectedAudioDeviceId(deviceId);
    localStorage.setItem(AUDIO_DEVICE_KEY, deviceId);
  };

  // Effect to handle switching to "My Scenarios" tab after saving a new one
  useEffect(() => {
    if (user.savedScenarios.length > prevScenariosLength.current) {
      setActiveTab('custom');
    }
    prevScenariosLength.current = user.savedScenarios.length;
  }, [user.savedScenarios]);

  // Effect to save draft scenarios to localStorage
  useEffect(() => {
    // A blank ID indicates a custom, unsaved scenario that the user is editing.
    if (selectedScenarioId === '') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scenario));
      } catch (error) {
        console.error("Failed to save scenario to localStorage:", error);
      }
    }
  }, [scenario, selectedScenarioId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setScenario(prev => ({ ...prev, [name]: value }));
    setSelectedScenarioId(''); // Deselect if user starts editing, marking it as a custom draft
  };

  const handleSelectScenario = (selected: SavedScenario) => {
    // Create a copy to prevent mutating the original preset object when editing form fields
    setScenario({ ...selected });
    setSelectedScenarioId(selected.id);
    // Clear the draft from storage since we've selected a saved/preset one.
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to remove draft scenario from localStorage:", error);
    }
  };

  const handleSave = () => {
    const name = prompt("Enter a name for this scenario:");
    if (name && name.trim()) {
      onSaveScenario(scenario, name.trim());
      // Clear the draft from localStorage after successfully saving it.
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (error) {
        console.error("Failed to remove draft scenario from localStorage:", error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (audioDevices.length === 0) {
      alert("No microphone found. Please connect a microphone and grant permission to start a call.");
      return;
    }
    onStartCall(scenario, selectedAudioDeviceId);
  };

  const handleDelete = (e: React.MouseEvent, scenarioId: string) => {
    e.stopPropagation(); // prevent selecting the scenario
    onDeleteScenario(scenarioId);
  };


  const scenariosForTab = activeTab === 'presets' ? PRESET_SCENARIOS : user.savedScenarios;

  const scenariosToDisplay = scenariosForTab.filter(s => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    const searchableText = [
      s.name,
      s.consultantRole,
      s.leadSource,
      s.clientRole,
      s.clientPersona,
      s.industry,
      s.objectionStyle
    ].join(' ').toLowerCase();
    return searchableText.includes(query);
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-6xl w-full bg-panel p-8 rounded-lg shadow-sm border border-border">
        <header className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-semibold text-text-primary font-heading">AI Sales Call Simulator</h1>
            <p className="text-text-secondary">Welcome, <span className="font-semibold text-text-primary">{user.name}</span>! Select or create a scenario to begin.</p>
            {user.subscriptionStatus === 'free' && (
              <p className="text-sm text-text-secondary mt-1">
                Credits Left: <span className={`font-semibold ${user.freeCredits && user.freeCredits < 5 ? 'text-red-500' : 'text-primary'}`}>
                  {user.freeCredits ? user.freeCredits.toFixed(1) : '0.0'}
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={onViewHistory} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
              <HistoryIcon className="w-5 h-5" />
              <span>View History</span>
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
              <LogoutIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          {/* Scenario Selection */}
          <div className="flex flex-col h-[600px] bg-background rounded-lg border border-border p-4">
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="w-5 h-5 text-text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Search by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-panel border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              />
            </div>
            <div className="flex border-b border-border">
              <button onClick={() => setActiveTab('presets')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'presets' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>Presets</button>
              <button onClick={() => setActiveTab('custom')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'custom' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>My Scenarios ({user.savedScenarios.length})</button>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto pr-2 mt-3">
              {scenariosToDisplay.length > 0 ? scenariosToDisplay.map(s => {
                const isDeleting = s.id === deletingScenarioId;
                return (
                  <div
                    key={s.id}
                    className={`flex items-center w-full text-left rounded-md transition-colors ${selectedScenarioId === s.id ? 'bg-primary/10' : 'hover:bg-panel'} ${isDeleting ? 'opacity-60' : ''}`}
                  >
                    <button
                      onClick={() => handleSelectScenario(s)}
                      disabled={isDeleting}
                      className={`flex-grow p-3 rounded-md ${selectedScenarioId === s.id ? 'text-primary' : ''}`}
                    >
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-xs text-text-secondary">{s.clientPersona} {s.clientRole} in {s.industry}</p>
                    </button>
                    {activeTab === 'custom' && (
                      <button
                        onClick={(e) => handleDelete(e, s.id)}
                        disabled={isDeleting}
                        className="p-3 mr-1 text-text-secondary hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Delete scenario ${s.name}`}
                      >
                        {isDeleting ? <LoadingIcon className="w-5 h-5" /> : <TrashIcon className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                )
              }) : (
                <div className="text-center py-10 text-text-secondary">
                  <p>No scenarios found for "{searchQuery}".</p>
                </div>
              )}
            </div>
          </div>

          {/* Scenario Details Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold font-heading text-text-primary mb-3">Scenario Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Your Role (Consultant)" name="consultantRole" value={scenario.consultantRole} onChange={handleChange} />
              <CustomSelectField label="Lead Source" name="leadSource" value={scenario.leadSource} options={['Cold Email', 'Referral', 'YouTube DM', 'Inbound Lead']} onChange={handleChange} />
              <InputField label="Client Role" name="clientRole" value={scenario.clientRole} onChange={handleChange} />
              <CustomSelectField label="Client Persona" name="clientPersona" value={scenario.clientPersona} options={['Skeptical', 'Friendly', 'Rushed', 'Confused', 'Talkative']} onChange={handleChange} />
              <InputField label="Industry" name="industry" value={scenario.industry} onChange={handleChange} />
              <CustomSelectField label="Objection Style" name="objectionStyle" value={scenario.objectionStyle} options={['Budget', 'Trust', 'No Need', 'Already working with someone']} onChange={handleChange} />
            </div>
            <div className="pt-2">
              <label htmlFor="audio-device" className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                <MicIcon className="w-5 h-5" />
                Microphone Input
              </label>
              <select
                id="audio-device"
                name="audio-device"
                value={selectedAudioDeviceId}
                onChange={handleAudioDeviceChange}
                disabled={audioDevices.length === 0}
                className="mt-1 block w-full bg-background border border-border rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {audioDevices.length > 0 ? (
                  audioDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                    </option>
                  ))
                ) : (
                  <option>No microphones found</option>
                )}
              </select>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Start Call
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 bg-panel hover:bg-background text-text-primary border border-border font-semibold py-3 px-4 rounded-lg transition duration-300"
              >
                Save as Custom
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;