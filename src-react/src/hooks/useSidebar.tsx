import { useEffect, useState } from "react";

export default function useSidebar() {
    const [appReady, setAppReady] = useState(false);
    const [containerClass, setContainerClass] = useState("sidebar-hidden");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (appReady) {
            setContainerClass(open ? "animate-slide-in" : "animate-slide-out");
        }
    }, [open, appReady]);
    
    const triggerSidebar = () => {
        if (!appReady) {
            setAppReady(true);
            setOpen(true);
            setContainerClass("animate-slide-in");
        } else {
            setOpen(!open);
            setContainerClass(open ? "animate-slide-in" : "animate-slide-out");
        }
    }

    

    return {appReady, containerClass, open, setOpen, triggerSidebar};
}