import React from 'react';
import { ChefHat, Shield, HardDrive } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-400">RecipeVault</span>
            <span className="text-gray-700 text-sm">v1.0</span>
          </div>

          {/* Privacy badges */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span>Privacy First — No tracking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-500" />
              <span>Data stored locally on your device</span>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-700">
            © {new Date().getFullYear()} RecipeVault. All rights reserved.
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800/50 text-center">
          <p className="text-xs text-gray-700">
            🔒 Your recipes are stored exclusively in your browser's localStorage.
            No data is sent to any server. Your cookbook stays private.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
