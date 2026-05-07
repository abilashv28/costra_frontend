export const theme = {
  layout: {
    header: "sticky top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 text-white p-3 md:p-4 shadow-lg",
    mobileHeader: "flex items-center justify-between bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 text-white p-4 md:hidden",
    sidebar: "fixed inset-y-0 left-0 top-0 z-50 bg-gradient-to-b from-blue-600 via-cyan-500 to-sky-500 text-white p-4 transform transition-all duration-300 ease-in-out md:overflow-hidden mt-0",
    main: "flex-1 bg-slate-100 p-4 md:p-6 w-full overflow-auto pt-0 transition-all duration-300",
    overlay: "fixed inset-0 z-30 bg-black/40 md:hidden",
    navLink: "flex items-center gap-3 px-3 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors duration-200",
    navLinkSecondary: "block px-3 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors duration-200",
  },
  button: {
    base: "inline-flex items-center justify-center rounded-full px-6 py-3 font-medium transition-all duration-300 ease-in-out transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-300",
    primary: "bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 text-white shadow-lg hover:from-blue-500 hover:via-cyan-400 hover:to-sky-600 hover:shadow-xl",
    secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    nav: "flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-sky-600 text-white shadow-md hover:from-cyan-400 hover:via-blue-500 hover:to-sky-700",
    userMenu: "w-full text-left px-4 py-3 hover:bg-slate-100 text-slate-900 font-medium flex items-center gap-2 transition",
  },
};
