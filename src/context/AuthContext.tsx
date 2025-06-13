import React, { createContext, useState, useContext, useEffect } from "react";

export type UserRole = "facility" | "finance" | "ceo" | "accountant" | "office_assistant" | null;

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profilePicture?: string;
  phoneNumber?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add some initial users for testing
const users: Array<{
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  profilePicture?: string;
  phoneNumber?: string;
}> = [
  {
    id: "1",
    email: "facility@example.com",
    password: "password123",
    name: "Facility Manager",
    role: "facility",
    profilePicture: "",
    phoneNumber: "03001234567"
  },
  {
    id: "2",
    email: "finance@example.com",
    password: "password123",
    name: "Finance Manager",
    role: "finance",
    profilePicture: "",
    phoneNumber: "03001234568"
  },
  {
    id: "3",
    email: "ceo@example.com",
    password: "password123",
    name: "CEO",
    role: "ceo",
    profilePicture: "",
    phoneNumber: "03001234569"
  },
  {
    id: "4",
    email: "accountant@example.com",
    password: "password123",
    name: "Accountant",
    role: "accountant",
    profilePicture: "",
    phoneNumber: "03001234570"
  },
  {
    id: "5",
    email: "assistant@example.com",
    password: "password123",
    name: "Office Assistant",
    role: "office_assistant",
    profilePicture: "",
    phoneNumber: "03001234571"
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to your backend
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error("Invalid email or password");
      }
      
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setLoading(true);
    try {
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        throw new Error("Email already in use");
      }
      
      // Create new user
      const newUser = {
        id: (users.length + 1).toString(),
        email,
        password,
        name,
        role,
        profilePicture: "",
        phoneNumber: ""
      };
      
      users.push(newUser);
      
      const { password: _, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...userData };
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    // Update in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex >= 0) {
      users[userIndex] = { 
        ...users[userIndex], 
        ...userData,
        password: users[userIndex].password // Preserve password
      };
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

