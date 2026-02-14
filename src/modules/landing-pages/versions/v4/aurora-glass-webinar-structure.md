# 🌌 AURORA GLASS – LANDING PAGE STRUCTURE
## WEBINAR: REVOLUSI AI INFLUENCER 2026

Single Page Landing
Theme: Aurora Glass + Cinematic Animation
Stack: React JS + Tailwind CSS + Framer Motion

---

# 🎨 DESIGN FOUNDATION

## Background
- Animated aurora gradient (blue → purple → cyan)
- Soft radial blur glow
- Subtle noise texture overlay
- Smooth loop animation (10–15s)

## Glass Style (Reusable Component)
- bg-white/10
- backdrop-blur-2xl
- border border-white/20
- rounded-3xl
- shadow-xl
- transition-all duration-500

Reusable component:
<GlassCard />

---

# 🧱 PAGE STRUCTURE (Single Page)

<App>
 ├── Navbar (transparent, blur on scroll)
 ├── HeroSection
 ├── BenefitsSection
 ├── VIPSection
 ├── BonusSection
 ├── FinalCTASection
 └── Footer
</App>

---

# 🟣 1️⃣ HERO SECTION (Full Screen 100vh)

## Content

Headline:
🤖 WEBINAR: REVOLUSI AI INFLUENCER 2026  
Bangun AI Influencer yang bisa jadi aset digital kamu 🎭⚡

Event Info:
📅 Sabtu, 14 Februari 2026  
🕒 19.00–21.00 WIB (Zoom)  
💰 Rp 250.000,-

CTA Button:
🎟 Daftar Sekarang
Link:
https://lynk.id/romance/o2jmp6z4d7ov

Countdown Timer (optional)

## Animation
- Fade + scale in glass card (0.9 → 1)
- Stagger text reveal
- Floating subtle animation (loop translateY 3px)
- CTA glow pulse every 3s

---

# 🟣 2️⃣ YANG KAMU DAPATKAN

Section Title:
🎁 Yang Kamu Dapatkan

## Content (2 Columns Checklist)

- ✅ Cara bikin AI influencer dari nol sampai siap launch
- ✅ Framework konten (pillar, hook, storytelling)
- ✅ Panduan praktek sampai posting pertama
- ✅ List tools lengkap (Gratis Lifetime Tool VIP Member)
- ✅ Akses Grup WhatsApp VIP Member

## Animation
- Scroll reveal (y: 80 → 0)
- Stagger checklist animation
- Hover glow border

---

# 🟣 3️⃣ BENEFIT VIP MEMBER

Section Title:
👑 Benefit VIP Member

## Content

🔑 Akses lifetime ke seluruh tools premium  
📚 Update materi & tools terbaru langsung di grup WA  
🤝 Support langsung dari mentor via grup WA  
🎬 Rekaman ulang (replay) webinar bisa ditonton kapan saja  
💡 Tips & trik eksklusif komunitas VIP  

## Animation
- Slide in from left
- Light sweep reflection effect on glass card

---

# 🟣 4️⃣ BONUS SPESIAL PESERTA

Section Title:
🔥 BONUS SPESIAL PESERTA

## Content

🎯 Support konten NSFW  
Kami mendukung pembuatan AI influencer untuk berbagai niche termasuk NSFW (18+)

📲 Aplikasi GRATIS  
Dibagikan untuk seluruh peserta webinar

⏳ Trial 3 Hari  
Coba gratis sebelum memutuskan

Disclaimer:
⚠️ Konten NSFW hanya ditujukan untuk pengguna berusia 18+ dan wajib mematuhi ketentuan serta regulasi platform yang digunakan.

## Animation
- Background aurora slightly brighter
- Scale hover 1.03
- Shimmer effect on BONUS title

---

# 🟣 5️⃣ FINAL CTA SECTION

Headline:
💬 Kuota Terbatas!  
Amankan Slotmu Sekarang

Price Highlight:
Rp 250.000,-

CTA Button:
📝 Daftar Sekarang
https://lynk.id/romance/o2jmp6z4d7ov

Subtext:
Slot terbatas & akses VIP hanya untuk peserta terdaftar.

## Animation
- Fade + upward motion
- Price scale in
- CTA glowing pulse
- Scroll progress bar at top

---

# 🟣 6️⃣ FOOTER

- Webinar Title
- 2026
- Optional Contact Info
- Social Media
- Copyright

Glass mini style.

---

# 📐 SPACING SYSTEM

Section Padding:
py-24

Container:
max-w-6xl mx-auto px-6

Glass Card Padding:
p-8 / p-10

---

# 🎨 COLOR PALETTE

Background:
#0F172A
#1E1B4B
#0EA5E9
#8B5CF6

Glass:
rgba(255,255,255,0.08)

Accent:
Soft cyan glow
Soft purple glow

---

# 🎬 ANIMATION STACK

- Framer Motion
- CSS Animated Gradient
- Smooth Scroll
- Hover Glow
- Floating Loop Animation
- Light Sweep Effect
- Scroll Progress Indicator

---

# 🎯 CONVERSION STRATEGY

- Event info visible immediately
- CTA placed in Hero + Final Section
- VIP benefit placed before bonus
- Bonus increases urgency
- Final CTA reinforced with limited slot message

---

END OF STRUCTURE
