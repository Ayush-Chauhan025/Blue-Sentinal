"use client"
import MapFooter from "@/components/MapFooter";
import MapComponent from "@/components/MapView";
import NavBar from "@/components/MapNavbar";

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col bg-transparent">
      <NavBar />
      <MapComponent />
      <MapFooter />
    </div>
  );
}