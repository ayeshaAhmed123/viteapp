
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  PieChart, 
  Settings,
  Building2,
  CircleDollarSign,
  User2,
  Package
} from "lucide-react";

const Sidebar = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["facility", "finance", "ceo", "accountant", "office_assistant"],
    },
    {
      title: "Demands",
      href: "/demands",
      icon: FileText,
      roles: ["facility", "finance", "ceo", "accountant", "office_assistant"],
    },
    {
      title: "Stock Management",
      href: "/stock",
      icon: Package,
      roles: ["facility", "ceo", "office_assistant"],
    },
    {
      title: "Reports",
      href: "/reports",
      icon: PieChart,
      roles: ["facility", "finance", "ceo", "accountant"],
    },
    {
      title: "Maintenance Records",
      href: "/maintenance",
      icon: Building2,
      roles: ["facility", "ceo", "office_assistant"],
    },
    {
      title: "Finance",
      href: "/finance",
      icon: CircleDollarSign,
      roles: ["finance", "ceo", "accountant"],
    },
    {
      title: "Profile",
      href: "/profile",
      icon: User2,
      roles: ["facility", "finance", "ceo", "accountant", "office_assistant"],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["facility", "finance", "ceo", "accountant", "office_assistant"],
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(currentUser.role as string)
  );

  const getRoleBgColor = () => {
    switch (currentUser?.role) {
      case "facility":
        return "border-facility";
      case "finance":
        return "border-finance";
      case "ceo":
        return "border-ceo";
      case "accountant":
        return "border-blue-500";
      case "office_assistant":
        return "border-green-500";
      default:
        return "border-gray-500";
    }
  };

  const getRoleTextColor = () => {
    switch (currentUser?.role) {
      case "facility":
        return "text-facility";
      case "finance":
        return "text-finance";
      case "ceo":
        return "text-ceo";
      case "accountant":
        return "text-blue-500";
      case "office_assistant":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="hidden md:flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center border-b px-6">
        <div className={`h-8 w-8 border-2 ${getRoleBgColor()} rounded-lg mr-2`}></div>
        <span className="text-lg font-semibold">
          Facility Flow Tracker
          <span className={`block text-xs font-normal ${getRoleTextColor()}`}>
            {currentUser.role === "facility" && "Facility Manager"}
            {currentUser.role === "finance" && "Finance Officer"}
            {currentUser.role === "ceo" && "Chief Executive"}
            {currentUser.role === "accountant" && "Accountant"}
            {currentUser.role === "office_assistant" && "Office Assistant"}
          </span>
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? `bg-gray-100 text-gray-900`
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
