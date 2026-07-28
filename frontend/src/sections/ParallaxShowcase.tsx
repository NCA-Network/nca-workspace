import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PillButton from "../components/PillButton";
import { getLenisInstance } from "../components/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

export default function ParallaxShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !imageRef.current) return;

      // Parallax effect on the background image
      gsap.fromTo(
        imageRef.current,
        { yPercent: -20 },
        {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // Content entrance animation
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 60%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  const handleClick = () => {
    const lenis = getLenisInstance();
    if (lenis) {
      lenis.scrollTo("#how-it-works", { offset: -72 });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] overflow-hidden flex items-center justify-center"
    >
      {/* Parallax Image Layer */}
      <div
        ref={imageRef}
        className="absolute top-0 left-0 w-full"
        style={{
          height: "140%",
          transform: "scale(1.4)",
          backgroundImage: "url(/images/architecture-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          willChange: "transform",
        }}
      />

      {/* Dark Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(26, 24, 20, 0.65)" }}
      />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-[1] text-center max-w-[800px] px-6"
        style={{ opacity: 0 }}
      >
        <p className="caption-text text-[#d4a574] tracking-[0.12em]">
          The future of business communication
        </p>
        <h2
          className="font-display text-[#f5f3ef] mt-5"
          style={{
            fontSize: "clamp(36px, 5vw, 72px)",
            fontWeight: 400,
            lineHeight: 1.05,
          }}
        >
          Turn Conversations Into Revenue
        </h2>
        <p className="font-body text-lg font-normal text-[rgba(245,243,239,0.8)] mt-6 leading-relaxed">
          Every message is an opportunity. NexusAI transforms casual inquiries
          into closed sales, automates your customer journey, and gives you back
          the time to focus on what matters — growing your business.
        </p>
        <div className="mt-10">
          <PillButton variant="outline-inverse" onClick={handleClick}>
            See How It Works
          </PillButton>
        </div>
      </div>
    </section>
  );
}
