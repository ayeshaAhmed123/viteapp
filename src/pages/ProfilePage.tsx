
import ProfileForm from "@/components/profile/ProfileForm";

const ProfilePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
      </div>
      
      <ProfileForm />
    </div>
  );
};

export default ProfilePage;
