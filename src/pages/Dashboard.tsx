// import React from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold text-gray-800">
                                Digital ID Admin
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={logout}
                                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                        <div className="px-4 py-5 sm:px-6 flex items-center">
                            <div className="bg-blue-100 rounded-full p-2 mr-4">
                                <UserIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Welcome back, {user?.fullName}!
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                            <h4 className="text-md font-medium text-gray-900 mb-2">
                                Your Roles
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {user?.role?.map((role, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
