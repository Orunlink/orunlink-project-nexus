
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileSectionProps {
  name: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number;
  projects: number;
}

const ProfileSection = ({
  name,
  bio,
  avatar,
  followers,
  following,
  projects,
}: ProfileSectionProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-orunlink-purple to-orunlink-light"></div>
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-4">
          <div className="relative">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
            <h1 className="text-xl font-bold">{name}</h1>
            <p className="text-gray-600 text-sm mt-1">{bio}</p>
          </div>
          <div className="flex-grow"></div>
          <div className="mt-4 sm:mt-0">
            <Button className="bg-orunlink-purple hover:bg-orunlink-dark">
              Follow
            </Button>
          </div>
        </div>

        <div className="flex justify-center sm:justify-start space-x-8 border-t border-gray-100 pt-4">
          <div className="text-center">
            <div className="font-semibold">{followers}</div>
            <div className="text-gray-500 text-sm">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{following}</div>
            <div className="text-gray-500 text-sm">Following</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{projects}</div>
            <div className="text-gray-500 text-sm">Projects</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
