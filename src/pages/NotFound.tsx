import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <SEO title="Page Not Found – MVP Demo" description="This page could not be found." />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-5xl font-bold gradient-text mb-4">404</h1>
          <p className="text-lg text-muted-foreground mb-6">Oops! Page not found</p>
          <a href="/"><Button variant="hero">Return to Home</Button></a>
        </div>
      </div>
    </>
  );
};

export default NotFound;
