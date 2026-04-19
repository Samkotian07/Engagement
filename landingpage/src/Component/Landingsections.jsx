import { useEffect, useRef, useState } from "react";

// ── Asset imports ──────────────────────────────────────────────────────────
// Place these PNGs in src/assets/
import magnolia   from "../assets/magnolia.png";   // white magnolia (image 2)
import lotus      from "../assets/lotus.png";       // pink lotus    (image 3)
import whiteFloral from "../assets/whiteFloral.png"; // white florals (image 4)
import butterfly  from "../assets/butterfly.png";   // butterfly     (image 5)
import bananaLeaf1 from "../assets/bananaLeaf1.png"; // single leaf   (image 6)
import bananaLeaf2 from "../assets/bananaLeaf2.png"; // double leaf   (image 7)

// ── Countdown target ───────────────────────────────────────────────────────
const EVENT_DATE = new Date("2026-05-10T10:00:00");

function useCountdown(target) {
  const calc = () => {
    const diff = Math.max(0, target - Date.now());
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ── Intersection observer hook ─────────────────────────────────────────────
function useInView(threshold = 0.18) {
  const ref  = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ══════════════════════════════════════════════════════════════════════════
//  COUNTER SECTION
// ══════════════════════════════════════════════════════════════════════════
function CounterSection() {
  const { days, hours, minutes, seconds } = useCountdown(EVENT_DATE);
  const [ref, visible] = useInView(0.1);

  const units = [
    { label: "Days",    value: days    },
    { label: "Hours",   value: hours   },
    { label: "Minutes", value: minutes },
    { label: "Seconds", value: seconds },
  ];

  return (
    <section ref={ref} style={{
      position: "relative",
      background: "linear-gradient(180deg, #06090a 0%, #0d1a0e 40%, #142016 100%)",
      padding: "100px 24px 120px",
      overflow: "hidden",
      textAlign: "center",
    }}>

      {/* Banana leaf — top left */}
      <img src={bananaLeaf2} alt="" style={{
        position: "absolute", top: "-40px", left: "-60px",
        width: "clamp(220px,35vw,420px)", opacity: 0.18,
        transform: "rotate(-20deg)", pointerEvents: "none",
        mixBlendMode: "screen",
      }} />

      {/* Banana leaf — bottom right */}
      <img src={bananaLeaf1} alt="" style={{
        position: "absolute", bottom: "-30px", right: "-40px",
        width: "clamp(180px,28vw,340px)", opacity: 0.15,
        transform: "rotate(160deg)", pointerEvents: "none",
        mixBlendMode: "screen",
      }} />

      {/* White floral — right mid */}
      <img src={whiteFloral} alt="" style={{
        position: "absolute", top: "10%", right: "-20px",
        width: "clamp(120px,18vw,220px)", opacity: 0.22,
        pointerEvents: "none", mixBlendMode: "screen",
      }} />

      {/* Divider line top */}
      <div style={{
        width: "1px", height: "60px",
        background: "linear-gradient(180deg, transparent, #a8c870)",
        margin: "0 auto 40px",
      }} />

      <p style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "clamp(9px,1.3vw,12px)",
        letterSpacing: "0.5em",
        textTransform: "uppercase",
        color: "#8ab858",
        marginBottom: "16px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s ease",
      }}>
        Counting Down To
      </p>

      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(32px,5vw,56px)",
        fontWeight: 300,
        color: "#f0ede4",
        letterSpacing: "0.06em",
        marginBottom: "64px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "all 0.9s 0.1s ease",
      }}>
        Our Special Day
      </h2>

      {/* Counter boxes */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "clamp(12px,3vw,40px)",
        flexWrap: "wrap",
      }}>
        {units.map((u, i) => (
          <div key={u.label} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.9)",
            transition: `all 0.7s ${0.15 + i * 0.1}s cubic-bezier(0.16,1,0.3,1)`,
          }}>
            <div style={{
              position: "relative",
              width: "clamp(72px,14vw,130px)",
              aspectRatio: "1",
              background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              border: "1px solid rgba(168,200,112,0.25)",
              borderRadius: "4px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}>
              {/* Corner accents */}
              {["tl","tr","bl","br"].map(c => (
                <div key={c} style={{
                  position: "absolute",
                  width: "10px", height: "10px",
                  borderColor: "rgba(168,200,112,0.5)",
                  borderStyle: "solid",
                  borderWidth: c.includes("t") ? "1px 0 0 0" : "0 0 1px 0",
                  ...(c.includes("l") ? { left: 6, borderLeftWidth: "1px" } : { right: 6, borderRightWidth: "1px" }),
                  ...(c.includes("t") ? { top: 6 } : { bottom: 6 }),
                }} />
              ))}

              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(28px,5vw,52px)",
                fontWeight: 300,
                color: "#f0ede4",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}>
                {String(u.value).padStart(2, "0")}
              </span>
              <span style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(7px,1vw,10px)",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#8ab858",
                marginTop: "6px",
              }}>
                {u.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Date line */}
      <div style={{
        marginTop: "52px",
        opacity: visible ? 1 : 0,
        transition: "opacity 1s 0.6s ease",
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: "16px",
        }}>
          <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,200,112,0.5))" }} />
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "clamp(14px,2vw,18px)",
            color: "#a8c070",
            letterSpacing: "0.18em",
          }}>
            10th May · 2026
          </span>
          <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, rgba(168,200,112,0.5), transparent)" }} />
        </div>
      </div>

      {/* Divider bottom */}
      <div style={{
        width: "1px", height: "60px",
        background: "linear-gradient(180deg, #a8c870, transparent)",
        margin: "60px auto 0",
      }} />
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  VENUE SECTION
// ══════════════════════════════════════════════════════════════════════════
function VenueSection() {
  const [ref, visible] = useInView(0.12);

  const details = [
    { icon: "📍", label: "Location",  value: "Bustan Corniche, Manjeshwar Beach" },
    { icon: "🕙", label: "Ceremony",  value: "10:45 AM — Muhurtham" },
    { icon: "📅", label: "Date",      value: "Sunday, 10th May 2026" },
  ];

  return (
    <section ref={ref} style={{
      position: "relative",
      background: "linear-gradient(180deg, #142016 0%, #1a2e1c 50%, #f5f2eb 50%, #f5f2eb 100%)",
      padding: "0 0 100px",
      overflow: "hidden",
    }}>

      {/* Lotus — top right accent */}
      <img src={lotus} alt="" style={{
        position: "absolute", top: "0%", right: "0px",
        width: "clamp(140px,20vw,260px)", opacity: 0.28,
        pointerEvents: "none", mixBlendMode: "screen",
      }} />

      {/* White floral — left */}
      <img src={whiteFloral} alt="" style={{
        position: "absolute", top: "30%", left: "-30px",
        width: "clamp(100px,15vw,200px)", opacity: 0.15,
        pointerEvents: "none",
        filter: "brightness(0.3) sepia(1) hue-rotate(80deg)",
      }} />

      {/* Banana leaf bottom right */}
      <img src={bananaLeaf1} alt="" style={{
        position: "absolute", bottom: "0", right: "-20px",
        width: "clamp(160px,22vw,280px)", opacity: 0.12,
        transform: "rotate(10deg) scaleX(-1)",
        pointerEvents: "none",
      }} />

      {/* Top dark band content */}
      <div style={{ padding: "80px 24px 100px", textAlign: "center" }}>
        <p style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(9px,1.2vw,11px)",
          letterSpacing: "0.5em",
          textTransform: "uppercase",
          color: "#8ab858",
          marginBottom: "14px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.7s ease",
        }}>
          You Are Invited
        </p>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(38px,6vw,72px)",
          fontWeight: 300,
          color: "#f0ede4",
          letterSpacing: "0.04em",
          lineHeight: 1.1,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.8s 0.1s ease",
        }}>
          The Venue
        </h2>
      </div>

      {/* Card */}
      <div style={{
        maxWidth: "820px",
        margin: "0 auto",
        padding: "0 20px",
        position: "relative",
        zIndex: 2,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "all 0.9s 0.2s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{
          background: "#ffffff",
          borderRadius: "2px",
          boxShadow: "0 24px 80px rgba(20,32,22,0.18), 0 4px 16px rgba(0,0,0,0.08)",
          overflow: "hidden",
          border: "1px solid rgba(168,200,112,0.2)",
        }}>

          {/* Map placeholder / venue image area */}
          <div style={{
            height: "clamp(180px,30vw,320px)",
            background: "linear-gradient(135deg, #1a3320 0%, #2a4830 40%, #1e3d24 70%, #162a18 100%)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}>
            {/* Decorative leaf inside card image */}
            <img src={bananaLeaf2} alt="" style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", opacity: 0.35,
              mixBlendMode: "overlay",
            }} />
            <img src={magnolia} alt="" style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", opacity: 0.12,
            }} />
            <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
              <div style={{
                width: "56px", height: "56px",
                borderRadius: "50%",
                border: "1px solid rgba(168,200,112,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
                background: "rgba(20,32,22,0.6)",
              }}>
                <span style={{ fontSize: "22px" }}>📍</span>
              </div>
              <p style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(11px,1.6vw,14px)",
                letterSpacing: "0.3em",
                color: "#c8e090",
                textTransform: "uppercase",
                
              }}>
                Bustan Corniche, Manjeshwar Beach
              </p>
            </div>
          </div>

          {/* Detail rows */}
          <div style={{ padding: "48px 40px" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "32px",
            }}>
              {details.map((d, i) => (
                <div key={d.label} style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.7s ${0.35 + i * 0.1}s ease`,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <span style={{ fontSize: "20px", marginTop: "2px" }}>{d.icon}</span>
                    <div>
                      <p style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: "10px",
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        color: "#7a9a50",
                        marginBottom: "4px",
                      }}>{d.label}</p>
                      <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(14px,2vw,17px)",
                        color: "#2a3828",
                        lineHeight: 1.4,
                      }}>{d.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{
              margin: "40px 0",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(120,160,80,0.3), transparent)",
            }} />

            {/* Map button */}
            <div style={{ textAlign: "center" }}>
              <a
                href="https://www.google.com/maps?q=BUSTAN+CORNICHE,+Manjeshwar+Beach,+Kasaragod,+Hosabettu,+Kerala+671323&ftid=0x3ba361371fcad827:0x980dfe703f7b3029&entry=gps&shh=CAE&lucs=,94297699,94284499,94231188,94280568,47071704,94218641,94282134,94286869&g_ep=CAISEjI2LjEwLjIuODc3MzE3OTEwMBgAIMi8BypILDk0Mjk3Njk5LDk0Mjg0NDk5LDk0MjMxMTg4LDk0MjgwNTY4LDQ3MDcxNzA0LDk0MjE4NjQxLDk0MjgyMTM0LDk0Mjg2ODY5QgJJTg%3D%3D&skid=0a3982b5-ee18-47f1-9ceb-76cad5ba0fe9&g_st=iw"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 36px",
                  background: "linear-gradient(135deg, #2a4828, #3a6038)",
                  color: "#d8f0b0",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "11px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderRadius: "1px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 20px rgba(30,60,24,0.25)",
                }}
                onMouseOver={e => e.currentTarget.style.background = "linear-gradient(135deg, #3a6038, #4a7848)"}
                onMouseOut={e => e.currentTarget.style.background = "linear-gradient(135deg, #2a4828, #3a6038)"}
              >
                <span>📍</span> View on Map
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  DETAILS / TIMING SECTION
// ══════════════════════════════════════════════════════════════════════════
function DetailsSection() {
  const [ref, visible] = useInView(0.1);

  const timeline = [
    { time: "9:00 AM",  icon: "🌸", title: "Guest Arrival",     desc: "Welcome drinks & floral arrangements await you" },
    { time: "10:00 AM", icon: "🪷", title: "Muhurtham",          desc: "The auspicious ceremony begins with traditional rites" },
    { time: "11:00 PM",  icon: "📸", title: "Photography",        desc: "Capturing memories among lush garden settings" },
    { time: "12:00 PM", icon: "🍽️", title: "Sadhya Lunch",       desc: "A simple lunch will be lovingly served as we gather to celebrate this special moment together" },
  ];

  return (
    <section ref={ref} style={{
      position: "relative",
      background: "#f5f2eb",
      padding: "100px 24px 120px",
      overflow: "hidden",
    }}>

      {/* Magnolia — top right */}
      <img src={magnolia} alt="" style={{
        position: "absolute", top: "-20px", right: "-30px",
        width: "clamp(180px,25vw,320px)", opacity: 0.18,
        pointerEvents: "none",
        filter: "sepia(0.2)",
      }} />

      {/* Butterfly — left mid */}
      <img src={butterfly} alt="" style={{
        position: "absolute", top: "35%", left: "-10px",
        width: "clamp(80px,12vw,150px)", opacity: 0.14,
        transform: "rotate(-15deg)",
        pointerEvents: "none",
        mixBlendMode: "multiply",
      }} />

      {/* Banana leaf bottom left */}
      <img src={bananaLeaf1} alt="" style={{
        position: "absolute", bottom: "-10px", left: "-30px",
        width: "clamp(160px,22vw,280px)", opacity: 0.10,
        transform: "rotate(15deg) scaleX(-1)",
        pointerEvents: "none",
      }} />

      {/* White floral — bottom right */}
      <img src={whiteFloral} alt="" style={{
        position: "absolute", bottom: "0", right: "-20px",
        width: "clamp(120px,16vw,200px)", opacity: 0.12,
        pointerEvents: "none",
        filter: "sepia(0.3) hue-rotate(60deg) brightness(0.7)",
      }} />

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: "72px" }}>
        <p style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(9px,1.2vw,11px)",
          letterSpacing: "0.5em",
          textTransform: "uppercase",
          color: "#7a9a50",
          marginBottom: "12px",
          opacity: visible ? 1 : 0,
          transition: "all 0.7s ease",
        }}>
          The Programme
        </p>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(36px,5.5vw,66px)",
          fontWeight: 300,
          color: "#1e3020",
          letterSpacing: "0.04em",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s 0.1s ease",
        }}>
          Day's Details
        </h2>
        <div style={{
          width: "48px", height: "1px",
          background: "linear-gradient(90deg, transparent, #8ab858, transparent)",
          margin: "20px auto 0",
          opacity: visible ? 1 : 0,
          transition: "opacity 1s 0.3s ease",
        }} />
      </div>

      {/* Timeline */}
      <div style={{
        maxWidth: "680px",
        margin: "0 auto",
        position: "relative",
      }}>
        {/* Centre line */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: 0, bottom: 0,
          width: "1px",
          background: "linear-gradient(180deg, transparent, rgba(120,160,80,0.3) 10%, rgba(120,160,80,0.3) 90%, transparent)",
          transform: "translateX(-50%)",
        }} />

        {timeline.map((item, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div key={item.time} style={{
              display: "flex",
              justifyContent: isLeft ? "flex-start" : "flex-end",
              marginBottom: "40px",
              opacity: visible ? 1 : 0,
              transform: visible
                ? "translateX(0)"
                : `translateX(${isLeft ? -30 : 30}px)`,
              transition: `all 0.7s ${0.2 + i * 0.1}s cubic-bezier(0.16,1,0.3,1)`,
            }}>
              <div style={{
                width: "calc(50% - 32px)",
                background: "#ffffff",
                borderRadius: "2px",
                padding: "20px 22px",
                border: "1px solid rgba(120,160,80,0.15)",
                boxShadow: "0 4px 20px rgba(30,50,24,0.07)",
                position: "relative",
              }}>
                {/* Dot on timeline */}
                <div style={{
                  position: "absolute",
                  top: "24px",
                  [isLeft ? "right" : "left"]: "-40px",
                  width: "16px", height: "16px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "2px solid #8ab858",
                  boxShadow: "0 0 0 4px rgba(138,184,88,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "7px",
                }} />

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "16px" }}>{item.icon}</span>
                  <span style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "10px",
                    letterSpacing: "0.25em",
                    color: "#7a9a50",
                    textTransform: "uppercase",
                  }}>{item.time}</span>
                </div>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(15px,2vw,18px)",
                  fontWeight: 600,
                  color: "#1e3020",
                  marginBottom: "4px",
                }}>{item.title}</p>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: "clamp(13px,1.6vw,15px)",
                  color: "#5a7850",
                  lineHeight: 1.5,
                }}>{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  DRESS CODE / NOTES
// ══════════════════════════════════════════════════════════════════════════
function DressCodeSection() {
  const [ref, visible] = useInView(0.15);

  const swatches = [
    { color: "#f5f2eb", label: "Ivory" },
    { color: "#c8dea0", label: "Sage" },
    { color: "#2a4828", label: "Forest" },
    { color: "#d4b896", label: "Champagne" },
    { color: "#8a6040", label: "Teak" },
  ];

  return (
    <section ref={ref} style={{
      position: "relative",
      background: "linear-gradient(180deg, #f5f2eb, #eef0e8)",
      padding: "90px 24px 110px",
      overflow: "hidden",
      textAlign: "center",
    }}>

      {/* Lotus left */}
      <img src={lotus} alt="" style={{
        position: "absolute", bottom: "-20px", left: "-20px",
        width: "clamp(140px,18vw,240px)", opacity: 0.13,
        transform: "scaleX(-1) rotate(-10deg)",
        pointerEvents: "none",
        filter: "sepia(0.3) brightness(0.8)",
      }} />

      {/* Banana leaf top right */}
      <img src={bananaLeaf2} alt="" style={{
        position: "absolute", top: "-30px", right: "-30px",
        width: "clamp(180px,24vw,300px)", opacity: 0.10,
        transform: "rotate(20deg)",
        pointerEvents: "none",
      }} />

      <p style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "clamp(9px,1.2vw,11px)",
        letterSpacing: "0.5em",
        textTransform: "uppercase",
        color: "#7a9a50",
        marginBottom: "12px",
        opacity: visible ? 1 : 0,
        transition: "all 0.7s ease",
      }}>Please Wear</p>

      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(36px,5.5vw,66px)",
        fontWeight: 300,
        color: "#1e3020",
        letterSpacing: "0.04em",
        marginBottom: "16px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s 0.1s ease",
      }}>Dress Code</h2>

      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: "italic",
        fontSize: "clamp(15px,2vw,19px)",
        color: "#5a7850",
        maxWidth: "520px",
        margin: "0 auto 52px",
        lineHeight: 1.7,
        opacity: visible ? 1 : 0,
        transition: "all 0.8s 0.2s ease",
      }}>
        We'd love for you to dress in shades that complement our lush, botanical celebration.
        Traditional or formal attire in the following palette is warmly encouraged.
      </p>

      {/* Swatches */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        flexWrap: "wrap",
        marginBottom: "52px",
      }}>
        {swatches.map((s, i) => (
          <div key={s.label} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.8)",
            transition: `all 0.6s ${0.3 + i * 0.08}s cubic-bezier(0.16,1,0.3,1)`,
            textAlign: "center",
          }}>
            <div style={{
              width: "clamp(48px,8vw,72px)",
              height: "clamp(48px,8vw,72px)",
              borderRadius: "50%",
              background: s.color,
              border: "2px solid rgba(30,48,32,0.15)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              margin: "0 auto 8px",
            }} />
            <span style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "9px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#5a7850",
            }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div style={{
        maxWidth: "600px", margin: "0 auto",
        background: "#ffffff",
        border: "1px solid rgba(120,160,80,0.18)",
        borderRadius: "2px",
        padding: "36px 40px",
        boxShadow: "0 8px 40px rgba(30,48,32,0.07)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "all 0.8s 0.4s ease",
      }}>
        <p style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "10px", letterSpacing: "0.3em",
          textTransform: "uppercase", color: "#7a9a50",
          marginBottom: "16px",
        }}>A Gentle Note</p>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "clamp(15px,2vw,18px)",
          color: "#2a3828",
          lineHeight: 1.8,
        }}>
          "On this joyous occasion, your presence is the greatest blessing we could ask for.
We kindly request no gifts your love, laughter, and good wishes mean the world to us.
We look forward to celebrating this beautiful beginning together with you."
        </p>
        <div style={{
          marginTop: "20px",
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(13px,1.6vw,15px)",
          color: "#8ab858",
          letterSpacing: "0.12em",
        }}>— Kavyashree &amp; Thilak</div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  WELCOME / CLOSING SECTION
// ══════════════════════════════════════════════════════════════════════════
function WelcomeSection() {
  const [ref, visible] = useInView(0.12);

  return (
    <section ref={ref} style={{
      position: "relative",
      background: "linear-gradient(180deg, #0d1a0e 0%, #142016 60%, #0a100a 100%)",
      padding: "120px 24px 140px",
      overflow: "hidden",
      textAlign: "center",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>

      {/* Banana leaf — top left large */}
      <img src={bananaLeaf2} alt="" style={{
        position: "absolute", top: "-60px", left: "-80px",
        width: "clamp(260px,38vw,480px)", opacity: 0.22,
        transform: "rotate(-15deg)",
        pointerEvents: "none", mixBlendMode: "screen",
      }} />

      {/* Banana leaf — bottom right */}
      <img src={bananaLeaf1} alt="" style={{
        position: "absolute", bottom: "-40px", right: "-50px",
        width: "clamp(220px,32vw,420px)", opacity: 0.20,
        transform: "rotate(170deg)",
        pointerEvents: "none", mixBlendMode: "screen",
      }} />

      {/* Magnolia — top right */}
      <img src={magnolia} alt="" style={{
        position: "absolute", top: "0", right: "0",
        width: "clamp(160px,22vw,300px)", opacity: 0.12,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }} />

      {/* Lotus — bottom left */}
      <img src={lotus} alt="" style={{
        position: "absolute", bottom: "0", left: "0",
        width: "clamp(140px,18vw,240px)", opacity: 0.14,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }} />

      {/* White florals — centre background */}
      <img src={whiteFloral} alt="" style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "clamp(200px,40vw,500px)", opacity: 0.05,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }} />

      {/* Butterfly floating */}
      <img src={butterfly} alt="" style={{
        position: "absolute", top: "18%", right: "8%",
        width: "clamp(70px,10vw,130px)", opacity: 0.20,
        mixBlendMode: "screen",
        animation: "floatButterfly 6s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      <style>{`
        @keyframes floatButterfly {
          0%,100% { transform: translateY(0) rotate(-5deg); }
          50%      { transform: translateY(-18px) rotate(5deg); }
        }
        @keyframes fadeRise {
          from { opacity:0; transform:translateY(32px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes goldPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(168,200,112,0); }
          50%      { box-shadow: 0 0 40px 8px rgba(168,200,112,0.12); }
        }
      `}</style>

      {/* Decorative top ornament */}
      <div style={{
        marginBottom: "40px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s ease",
      }}>
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
          <line x1="0" y1="20" x2="48" y2="20" stroke="#8ab858" strokeWidth="0.8" strokeOpacity="0.6"/>
          <circle cx="60" cy="20" r="6" fill="none" stroke="#8ab858" strokeWidth="0.8" strokeOpacity="0.7"/>
          <circle cx="60" cy="20" r="2" fill="#8ab858" fillOpacity="0.5"/>
          <line x1="72" y1="20" x2="120" y2="20" stroke="#8ab858" strokeWidth="0.8" strokeOpacity="0.6"/>
        </svg>
      </div>

      <p style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "clamp(9px,1.3vw,12px)",
        letterSpacing: "0.55em",
        textTransform: "uppercase",
        color: "#8ab858",
        marginBottom: "24px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.8s 0.1s ease",
      }}>
        With All Our Love
      </p>

      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(44px,8vw,96px)",
        fontWeight: 300,
        lineHeight: 1.06,
        letterSpacing: "0.04em",
        marginBottom: "28px",
        background: "linear-gradient(180deg, #f0ede4 0%, #c8dea0 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: "all 0.9s 0.2s cubic-bezier(0.16,1,0.3,1)",
      }}>
        We Can't Wait<br />
        <em style={{ fontStyle: "italic", fontWeight: 300 }}>to See You</em>
      </h2>

      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: "italic",
        fontSize: "clamp(16px,2.2vw,22px)",
        color: "#a8c070",
        maxWidth: "480px",
        lineHeight: 1.75,
        marginBottom: "56px",
        opacity: visible ? 1 : 0,
        transition: "all 0.9s 0.35s ease",
      }}>
        "A journey of two hearts becoming one, celebrated beneath the
        shade of banana leaves and the fragrance of white magnolias."
      </p>

      {/* Names */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "clamp(16px,4vw,48px)",
        marginBottom: "56px",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.95)",
        transition: "all 0.9s 0.45s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(28px,5vw,56px)",
          fontWeight: 300,
          color: "#f0ede4",
          letterSpacing: "0.06em",
        }}>Ramyashree</span>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px", height: "40px",
            borderRadius: "50%",
            border: "1px solid rgba(168,200,112,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "goldPulse 3s ease-in-out infinite",
          }}>
            <span style={{ fontSize: "16px" }}>💚</span>
          </div>
        </div>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(28px,5vw,56px)",
          fontWeight: 300,
          color: "#f0ede4",
          letterSpacing: "0.06em",
        }}>Thilak</span>
      </div>

      {/* Date badge */}
      <div style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "28px 48px",
        border: "1px solid rgba(168,200,112,0.25)",
        borderRadius: "2px",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(10px)",
        marginBottom: "60px",
        opacity: visible ? 1 : 0,
        transition: "all 0.8s 0.55s ease",
        animation: visible ? "goldPulse 4s 1s ease-in-out infinite" : "none",
      }}>
        <p style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "10px", letterSpacing: "0.4em",
          textTransform: "uppercase", color: "#7a9a50",
          marginBottom: "8px",
        }}>The Day</p>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(18px,3vw,28px)",
          color: "#f0ede4",
          letterSpacing: "0.08em",
        }}>10th May · 2026</p>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "clamp(12px,1.6vw,15px)",
          color: "#8ab858",
          marginTop: "6px",
        }}>Bustan Corniche, Manjeshwar Beach</p>
      </div>

      {/* Bottom ornament */}
      <div style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 1s 0.7s ease",
      }}>
        <svg width="200" height="32" viewBox="0 0 200 32" fill="none">
          <line x1="0" y1="16" x2="80" y2="16" stroke="#8ab858" strokeWidth="0.6" strokeOpacity="0.4"/>
          <path d="M90 16 Q100 6 110 16 Q100 26 90 16Z" fill="none" stroke="#8ab858" strokeWidth="0.8" strokeOpacity="0.5"/>
          <line x1="120" y1="16" x2="200" y2="16" stroke="#8ab858" strokeWidth="0.6" strokeOpacity="0.4"/>
        </svg>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "clamp(12px,1.5vw,14px)",
          color: "rgba(168,192,112,0.5)",
          letterSpacing: "0.2em",
          marginTop: "20px",
        }}>
          With immeasurable joy, we await your presence.
        </p>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT — compose all sections
// ══════════════════════════════════════════════════════════════════════════
export default function LandingSections() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
      `}</style>
      <CounterSection  />
      <VenueSection    />
      <DetailsSection  />
      <DressCodeSection/>
      <WelcomeSection  />
    </>
  );
}