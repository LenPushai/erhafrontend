    // ADD THIS METHOD TO YOUR JWT AUTHENTICATION FILTER CLASS
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // Skip JWT filter for auth endpoints
        return path.startsWith("/api/auth/") || 
               path.equals("/api/auth/login") || 
               path.equals("/api/auth/test") ||
               path.equals("/api/auth/debug");
    }