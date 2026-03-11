import React, { useState, useEffect } from "react";
import { MonitorX } from "lucide-react";
import { Flex, Text } from "@shared/ui";

// 🌟 1. THE NATIVE HOOK (Zero Dependencies!)
const useNativeMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set the initial value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Create a listener for when the window is resized
    const listener = () => setMatches(media.matches);
    
    // Attach the listener
    media.addEventListener("change", listener);
    
    // Cleanup on unmount
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

// 🌟 2. THE BOUNCER COMPONENT
export const MobileBouncer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our shiny new native hook!
  const isMobile = useNativeMediaQuery("(max-width: 640px)");

  if (isMobile) {
    return (
      <Flex 
        $fill 
        $direction="column" 
        $align="center" 
        $justify="center" 
        $bg="bg.main" 
        $gap="md" 
        style={{ textAlign: "center", padding: "2rem" }}
      >
        <MonitorX size={56} color="#60a5fa" style={{ marginBottom: "1rem" }} />
        
        <Text $size="h2" $weight="bold" $color="primary">
          Axon is a Desktop Experience 🧠
        </Text>
        
        <Text $size="md" $color="secondary" style={{ maxWidth: "400px", lineHeight: 1.6 }}>
          Visualizing and bundling complex codebase architectures requires serious screen real estate. 
          <br /><br />
          Please bookmark this page or send the link to yourself, and open it on your desktop monitor to experience the magic!
        </Text>
      </Flex>
    );
  }

  // If they are on a big screen, let them through!
  return <>{children}</>;
};