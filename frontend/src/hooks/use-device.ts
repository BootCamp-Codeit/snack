"use client";

import { useState, useEffect } from "react";

export type Device = "pc" | "mobile";

const MOBILE_MAX_WIDTH = 767;

export function useDevice(): Device {
  const [device, setDevice] = useState<Device>("pc");

  useEffect(() => {
    const check = () => {
      setDevice(window.innerWidth <= MOBILE_MAX_WIDTH ? "mobile" : "pc");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return device;
}
