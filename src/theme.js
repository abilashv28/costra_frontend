export const theme = {
  layout: {
    // Glass header
    header: "sticky top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 text-gray-900 p-3 md:p-4 shadow-sm transition-all",
    mobileHeader: "flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-200 text-gray-900 p-4 md:hidden",
    
    // Sidebar: deep modern dark theme
    sidebar: "fixed inset-y-0 left-0 top-0 z-50 bg-slate-900 text-white p-4 transform transition-all duration-300 ease-in-out md:overflow-hidden mt-0 shadow-2xl",
    
    // Bottom Nav (Mobile)
    bottomNav: "fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-gray-200 flex flex-nowrap items-center px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] md:hidden transition-transform duration-300 overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x touch-pan-x",
    
    // Main content area needs padding bottom on mobile to account for bottom nav
    main: "flex-1 bg-slate-50 p-4 md:p-6 w-full overflow-auto pt-0 pb-24 md:pb-6 transition-all duration-300",
    
    overlay: "fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden transition-opacity",
    
    // Navigation links in sidebar
    navLink: "flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200 font-medium",
    navLinkActive: "flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium shadow-md shadow-cyan-500/20",
    navLinkSecondary: "block px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200",
    
    // Bottom nav links
    bottomNavLink: "flex flex-col items-center gap-1 p-2 min-w-[72px] rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors snap-start flex-shrink-0",
    bottomNavLinkActive: "flex flex-col items-center gap-1 p-2 min-w-[72px] rounded-xl text-blue-600 bg-blue-50 font-medium snap-start flex-shrink-0",
  },
  button: {
    base: "inline-flex items-center justify-center rounded-xl px-6 py-2.5 font-semibold transition-all duration-300 ease-out transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 active:scale-[0.98]",
    primary: "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30 hover:from-blue-700 hover:to-cyan-600 hover:shadow-lg hover:shadow-blue-600/40 hover:-translate-y-0.5",
    secondary: "bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 shadow-sm hover:bg-white hover:border-slate-300 hover:shadow hover:-translate-y-0.5",
    danger: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/30 hover:from-red-600 hover:to-rose-700 hover:shadow-lg hover:shadow-red-600/40 hover:-translate-y-0.5",
    nav: "flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors hover:-translate-y-0.5",
    userMenu: "w-full text-left px-4 py-2.5 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-2 transition-colors rounded-lg",
  },
};
