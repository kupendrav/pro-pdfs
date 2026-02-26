import React, { useState } from 'react';
import { Menu, X, ChevronDown, FileText, User, LogOut, Settings } from 'lucide-react';
import { NAV_STRUCTURE } from '../constants';

interface NavbarProps {
  onNavigate: () => void;
  user?: any;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onToolClick?: (toolId: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, user, onLoginClick, onLogoutClick, onToolClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={onNavigate}>
            <div className="shrink-0 flex items-center gap-2">
              <div className="bg-red-600 p-1.5 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">K-PDF's</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {NAV_STRUCTURE.map((group) => (
              <div 
                key={group.label}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(group.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors group-hover:bg-gray-50">
                  {group.label}
                  <ChevronDown className="ml-1.5 h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </button>

                {/* Dropdown */}
                {activeDropdown === group.label && (
                  <div className="absolute left-0 mt-0 w-64 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 py-2 transform transition-all duration-200 origin-top-left z-50">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-2">
                      {group.label}
                    </div>
                    {group.items.map((item) => {
                        const title = item.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ').replace('Pdf', 'PDF').replace('Jpg', 'JPG').replace('Html', 'HTML').replace('Ocr', 'OCR');
                        return (
                          <button
                            key={item}
                            onClick={() => {
                              setActiveDropdown(null);
                              onToolClick?.(item);
                            }}
                            className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            {title}
                          </button>
                        )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons / User Profile */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full border border-gray-200" />
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                     <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                     </div>
                     <a href="#" className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 items-center gap-2">
                        <User className="w-4 h-4" /> Profile
                     </a>
                     <a href="#" className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 items-center gap-2">
                        <Settings className="w-4 h-4" /> Settings
                     </a>
                     <button 
                        onClick={() => {
                            setUserDropdownOpen(false);
                            onLogoutClick();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                     >
                        <LogOut className="w-4 h-4" /> Sign out
                     </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button 
                    onClick={onLoginClick} 
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    Login
                </button>
                <button 
                    onClick={onLoginClick}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                >
                    Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 h-[60vh] overflow-y-auto">
            {NAV_STRUCTURE.map((group) => (
               <div key={group.label} className="border-b border-gray-100 pb-2 mb-2 last:border-0">
                  <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase">{group.label}</div>
                  {group.items.map(item => {
                       const title = item.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ').replace('Pdf', 'PDF').replace('Jpg', 'JPG').replace('Html', 'HTML').replace('Ocr', 'OCR');
                      return (
                        <button
                        key={item}
                        className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onToolClick?.(item);
                        }}
                        >
                        {title}
                        </button>
                      )
                  })}
               </div>
            ))}
          </div>
          <div className="pt-4 pb-6 px-4 border-t border-gray-200">
            {user ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button onClick={onLogoutClick} className="text-gray-500 hover:text-red-600">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <button onClick={onLoginClick} className="flex-1 text-center py-3 text-base font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg">Login</button>
                    <button onClick={onLoginClick} className="flex-1 text-center py-3 text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Sign up</button>
                </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;