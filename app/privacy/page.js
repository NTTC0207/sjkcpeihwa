import Link from "next/link";

export const metadata = {
  title: "Dasar Privasi | Privacy Policy | 隐私政策",
  description:
    "Dasar Privasi SJKC Pei Hwa Machang – maklumat tentang penggunaan kuki dan Google Analytics.",
  openGraph: {
    title: "Dasar Privasi | SJKC Pei Hwa",
    description: "Dasar Privasi rasmi SJKC Pei Hwa Machang.",
    url: "https://sjkcpeihwa.vercel.app/privacy",
    siteName: "SJKC Pei Hwa",
    type: "website",
  },
};

const sections = [
  {
    lang: "ms",
    flag: "",
    title: "Dasar Privasi",
    lastUpdated: "Dikemas kini: Februari 2026",
    items: [
      {
        heading: "1. Gambaran Keseluruhan",
        body: "SJKC Pei Hwa Machang ('kami') menghormati privasi semua pengunjung laman web ini. Dasar Privasi ini menerangkan bagaimana maklumat dikumpul dan digunakan apabila anda melawat laman web rasmi kami di sjkcpeihwa",
      },
      {
        heading: "2. Maklumat yang Dikumpul",
        body: "Kami menggunakan Google Analytics untuk mengumpul maklumat penggunaan laman web secara anonim, termasuk: halaman yang dilawati, tempoh masa melayari, jenis peranti dan pelayar, serta lokasi geografi secara umum (negeri/negara). Kami TIDAK mengumpul nama, alamat e-mel, nombor telefon atau apa-apa maklumat peribadi tanpa pengetahuan anda.",
      },
      {
        heading: "3. Penggunaan Kuki (Cookies)",
        body: "Google Analytics menggunakan kuki untuk membezakan pengguna. Kuki ini disimpan di peranti anda dan membantu kami memahami bagaimana pengunjung berinteraksi dengan laman web ini. Anda boleh menyahaktifkan kuki melalui tetapan pelayar anda bila-bila masa.",
      },
      {
        heading: "4. Google Analytics",
        body: "Kami menggunakan Google Analytics (ID Pengukuran: G-M9CXCS6NWJ). Data dikongsi dengan Google LLC mengikut Dasar Privasi Google (policies.google.com/privacy). Anda boleh menyahaktifkan penjejakan Google Analytics dengan memasang tambahan pelayar di: tools.google.com/dlpage/gaoptout.",
      },
      {
        heading: "5. Pendedahan kepada Pihak Ketiga",
        body: "Kami tidak menjual, memperdagangkan atau memindahkan maklumat anda kepada pihak luar. Google Analytics adalah satu-satunya pihak ketiga yang menerima data analitik daripada laman web ini.",
      },
      {
        heading: "6. Undang-undang yang Terpakai",
        body: "Laman web ini mematuhi Akta Perlindungan Data Peribadi 2010 (PDPA) Malaysia.",
      },
      {
        heading: "7. Hubungi Kami",
        body: "Sekiranya anda mempunyai sebarang pertanyaan berkenaan dasar privasi ini, sila hubungi kami di: dbc2185@moe.edu.my",
      },
    ],
  },
  {
    lang: "zh",
    flag: "",
    title: "隐私政策",
    lastUpdated: "更新日期：2026年2月",
    items: [
      {
        heading: "1. 概述",
        body: "马樟培华国民型华文小学（以下简称「本校」）尊重所有网站访客的隐私。本隐私政策说明当您访问我们的官方网站 sjkcpeihwa 时，我们如何收集和使用信息。",
      },
      {
        heading: "2. 收集的信息",
        body: "我们使用 Google Analytics 匿名收集网站使用数据，包括：浏览的页面、浏览时长、设备和浏览器类型，以及大概的地理位置（州/国家）。我们不收集您的姓名、电子邮件地址、电话号码或任何个人身份信息。",
      },
      {
        heading: "3. Cookie（小型文字档案）使用",
        body: "Google Analytics 使用 Cookie 区分不同用户。这些 Cookie 存储在您的设备上，帮助我们了解访客如何与本网站互动。您可以随时通过浏览器设置禁用 Cookie。",
      },
      {
        heading: "4. Google Analytics",
        body: "我们使用 Google Analytics（衡量 ID：G-M9CXCS6NWJ）。数据根据 Google 隐私政策（policies.google.com/privacy）与 Google LLC 共享。您可以通过安装以下浏览器插件来停用 Google Analytics 追踪：tools.google.com/dlpage/gaoptout",
      },
      {
        heading: "5. 第三方信息披露",
        body: "我们不会向任何第三方出售、交易或转让您的信息。Google Analytics 是唯一从本网站接收分析数据的第三方。",
      },
      {
        heading: "6. 适用法律",
        body: "本网站遵守马来西亚《2010年个人数据保护法》（PDPA）。",
      },
      {
        heading: "7. 联系我们",
        body: "如您对本隐私政策有任何疑问，请通过以下方式联系我们：dbc2185@moe.edu.my",
      },
    ],
  },
  {
    lang: "en",
    flag: "",
    title: "Privacy Policy",
    lastUpdated: "Updated: February 2026",
    items: [
      {
        heading: "1. Overview",
        body: "SJKC Pei Hwa Machang ('we') respects the privacy of all visitors to this website. This Privacy Policy explains how information is collected and used when you visit our official website at sjkcpeihwa",
      },
      {
        heading: "2. Information Collected",
        body: "We use Google Analytics to collect anonymous website usage data including: pages visited, time spent browsing, device and browser type, and general geographic location (state/country). We do NOT collect your name, email address, phone number or any personally identifiable information.",
      },
      {
        heading: "3. Cookie Usage",
        body: "Google Analytics uses cookies to distinguish users. These cookies are stored on your device and help us understand how visitors interact with this website. You can disable cookies through your browser settings at any time.",
      },
      {
        heading: "4. Google Analytics",
        body: "We use Google Analytics (Measurement ID: G-M9CXCS6NWJ). Data is shared with Google LLC in accordance with Google's Privacy Policy (policies.google.com/privacy). You can opt out of Google Analytics tracking by installing the browser add-on at: tools.google.com/dlpage/gaoptout",
      },
      {
        heading: "5. Third-Party Disclosure",
        body: "We do not sell, trade, or transfer your information to outside parties. Google Analytics is the only third party that receives analytics data from this website.",
      },
      {
        heading: "6. Applicable Law",
        body: "This website complies with Malaysia's Personal Data Protection Act 2010 (PDPA).",
      },
      {
        heading: "7. Contact Us",
        body: "If you have any questions regarding this Privacy Policy, please contact us at: dbc2185@moe.edu.my",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #f7f9fc 0%, #e8eef7 100%)",
        paddingBottom: "80px",
      }}
    >
      {/* Hero Banner */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #123469 0%, #1a4993 60%, #1a4993 100%)",
          padding: "64px 24px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "rgba(254,193,7,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "-40px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, paddingTop: "24px" }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(254,193,7,0.2)",
              color: "#fec107",
              borderRadius: "20px",
              padding: "15px 16px",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              marginBottom: "16px",
              border: "1px solid rgba(254,193,7,0.3)",
            }}
          >
            🔒 PDPA Compliant
          </span>
          <h1
            style={{
              color: "white",
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 800,
              fontFamily: "'Outfit', 'Noto Sans SC', sans-serif",
              margin: "0 0 8px",
              lineHeight: 1.2,
            }}
          >
            Dasar Privasi · 隐私政策 · Privacy Policy
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
            SJKC Pei Hwa Machang
          </p>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "48px 24px 0",
          display: "flex",
          flexDirection: "column",
          gap: "40px",
        }}
      >
        {sections.map((section) => (
          <article
            key={section.lang}
            style={{
              background: "white",
              borderRadius: "20px",
              boxShadow: "0 4px 24px rgba(26,73,147,0.08)",
              overflow: "hidden",
              border: "1px solid rgba(26,73,147,0.07)",
            }}
          >
            {/* Section Header */}
            <div
              style={{
                background: "linear-gradient(90deg, #1a4993 0%, #2563b0 100%)",
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "24px" }}>{section.flag}</span>
              <div>
                <h2
                  style={{
                    color: "white",
                    fontFamily: "'Outfit', 'Noto Sans SC', sans-serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {section.title}
                </h2>
                <p
                  style={{
                    color: "#93c5fd",
                    fontSize: "12px",
                    margin: "2px 0 0",
                  }}
                >
                  {section.lastUpdated}
                </p>
              </div>
            </div>

            {/* Policy Items */}
            <div
              style={{
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {section.items.map((item) => (
                <div key={item.heading}>
                  <h3
                    style={{
                      color: "#1a4993",
                      fontFamily: "'Outfit', 'Noto Sans SC', sans-serif",
                      fontSize: "15px",
                      fontWeight: 700,
                      margin: "0 0 6px",
                    }}
                  >
                    {item.heading}
                  </h3>
                  <p
                    style={{
                      color: "#475569",
                      fontSize: "14px",
                      lineHeight: "1.75",
                      margin: 0,
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}

        {/* Back Link */}
        <div style={{ textAlign: "center", paddingTop: "8px" }}>
          <Link
            href="/"
            id="privacy-back-home-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#1a4993",
              color: "white",
              borderRadius: "10px",
              padding: "12px 28px",
              fontWeight: 600,
              fontSize: "14px",
              textDecoration: "none",
              transition: "background 0.2s",
              fontFamily: "'Outfit', 'Inter', sans-serif",
            }}
          >
            ← Kembali ke Laman Utama / 返回主页 / Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
