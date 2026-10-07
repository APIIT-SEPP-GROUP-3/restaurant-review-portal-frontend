import type { Metadata } from "next";
import { AboutContent } from "@/components/about/about-content";

export const metadata: Metadata = {
  title: "About",
  description: "Get to know DineRate: discover restaurants, explore menus, and share your dining experiences through helpful reviews and conversations.",
};

export default function AboutPage() { return <AboutContent />; }
