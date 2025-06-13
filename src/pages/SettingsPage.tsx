
import SettingsForm from "@/components/settings/SettingsForm";

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      
      <SettingsForm />
    </div>
  );
};

export default SettingsPage;