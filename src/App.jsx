import React, { useEffect, useMemo, useState } from 'react';

function GlowButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 glow-button ${className}`}
    >
      {children}
      <style jsx>{`
        .glow-button {
          background-color: rgba(168, 85, 247, 0.15);
          border: 1px solid rgba(168, 85, 247, 0.35);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          color: white;
          font-weight: 500;
          font-family: Inter, sans-serif;
          transition: all 0.3s ease;
        }
        .glow-button:hover {
          border: 1px solid rgba(168, 85, 247, 0.75);
          box-shadow: 0 0 25px rgba(168, 85, 247, 0.45);
        }
        .delete-button {
          background-color: rgba(255, 50, 50, 0.2);
          border: 1px solid rgba(255, 50, 50, 0.4);
          color: white;
        }
      `}</style>
    </button>
  );
}

export default function RomPortalApp() {
  useEffect(() => {
    // Buat elemen <style> dan import font Poppins dari Google
    const style = document.createElement("style");
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
    `;
    document.head.appendChild(style);
}, []);

  const API_URL = 'http://localhost:3000/files';
  const DEFAULT_THUMBNAIL = 'https://raw.githubusercontent.com/KayokoProject/OnikataKayoko/main/default/Pic.jpg';
  const CATEGORY_PRESETS = ['Module', 'Port'];
  const PILL_PRESETS = ['Stabil', 'Beta', 'Support All Android'];

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [customPill, setCustomPill] = useState('');
  const [customPillHistory, setCustomPillHistory] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', creator: '', category: CATEGORY_PRESETS[0],
    thumbnail: null, fileUrl: '', pills: []
  });

  useEffect(() => {
    const storedHistory = localStorage.getItem('customPillHistory');
    if (storedHistory) {
      setCustomPillHistory(JSON.parse(storedHistory));
    }

    (async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setItems((data || []).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      } catch (err) {
        console.error('Fetch failed:', err);
        setItems([]);
      }
    })();
  }, []);

  const previewUrl = useMemo(() => {
    if (!form.thumbnail) return DEFAULT_THUMBNAIL;
    return URL.createObjectURL(form.thumbnail);
  }, [form.thumbnail]);

  const filteredItems = useMemo(
    () => items.filter((item) =>
      [item.title, item.creator, item.category].join(' ').toLowerCase().includes(search.toLowerCase())
    ),
    [items, search]
  );

  const togglePill = (pill) => {
    setForm((prev) => {
      const exists = prev.pills.includes(pill);
      if (!exists && prev.pills.length >= 6) return prev;
      return {
        ...prev,
        pills: exists ? prev.pills.filter((p) => p !== pill) : [...prev.pills, pill],
      };
    });
  };

  const addCustomPill = () => {
    const value = customPill.trim();
    if (!value) return;

    setForm((prev) => {
      const filtered = prev.pills.filter((p) => PILL_PRESETS.includes(p));
      return { ...prev, pills: [...filtered, value] };
    });

    setCustomPillHistory((prev) => {
      const newHistory = [value, ...prev.filter((p) => p !== value)].slice(0, 3);
      localStorage.setItem('customPillHistory', JSON.stringify(newHistory));
      return newHistory;
    });

    setCustomPill('');
  };

  const addItem = async () => {
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'pills') fd.append(k, JSON.stringify(v));
        else if (v) fd.append(k, v); // fileUrl ikut tersimpan
      });

      const res = await fetch(API_URL, { method: 'POST', body: fd });
      const item = await res.json();
      setItems((prev) => [item, ...prev]);

      setForm({
        title: '', description: '', creator: '', category: CATEGORY_PRESETS[0],
        thumbnail: null, fileName: '', fileData: null, pills: []
      });
      setCustomPill('');
      setActiveTab('home');
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getPillStyle = (pill) => {
    switch (pill) {
      case 'Stabil':
        return {
          backgroundColor: 'rgba(34,197,94,0.22)',
          border: '1px solid rgba(34,197,94,0.55)',
          boxShadow: '0 0 14px rgba(34,197,94,0.25)',
        };

      case 'Beta':
        return {
          backgroundColor: 'rgba(249,115,22,0.22)',
          border: '1px solid rgba(249,115,22,0.55)',
          boxShadow: '0 0 14px rgba(249,115,22,0.25)',
        };

      case 'Support All Android':
        return {
          backgroundColor: 'rgba(59,130,246,0.22)',
          border: '1px solid rgba(59,130,246,0.55)',
          boxShadow: '0 0 14px rgba(59,130,246,0.25)',
        };

      case 'Module':
      case 'Port':
        return {
          backgroundColor: 'rgba(168,85,247,0.22)',
          border: '1px solid rgba(168,85,247,0.55)',
          boxShadow: '0 0 14px rgba(168,85,247,0.25)',
        };

      default:
        return {
          backgroundColor: 'rgba(168,85,247,0.22)',
          border: '1px solid rgba(168,85,247,0.55)',
          boxShadow: '0 0 14px rgba(168,85,247,0.25)',
        };
    }
  };

  const inputStyle = {
    backgroundColor: 'rgba(168,85,247,0.15)',
    border: '1px solid rgba(168,85,247,0.3)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    outline: 'none',
    color: 'white',
    padding: '0.75rem',
    borderRadius: '1rem',
    fontFamily: 'Inter, sans-serif',
  };

  const uploadCardStyle = {
    backgroundColor: 'rgba(168,85,247,0.16)',
    border: '1px solid rgba(168,85,247,0.38)',
    backdropFilter: 'blur(72px)',
    WebkitBackdropFilter: 'blur(72px)',
    borderRadius: '1.5rem',
    boxShadow: '0 0 35px rgba(168,85,247,0.22), 0 0 90px rgba(139,0,255,0.18), inset 0 0 12px rgba(255,255,255,0.04)',
    overflow: 'hidden',
  };

  const cardStyle = {
    backgroundColor: 'rgba(168,85,247,0.12)',
    border: '1px solid rgba(168,85,247,0.3)',
    backdropFilter: 'blur(48px)',
    WebkitBackdropFilter: 'blur(48px)',
    borderRadius: '1.5rem',
    boxShadow: '0 25px 50px -12px rgba(139,0,255,0.25)',
    overflow: 'hidden',
  };

  const backgroundStyles = {
    fontFamily: 'Inter, sans-serif',
    background:
      'radial-gradient(circle at 20% 20%, rgba(139,92,246,0.45), transparent 30%), radial-gradient(circle at 80% 30%, rgba(168,85,247,0.35), transparent 35%), linear-gradient(135deg, #1c0a2b, #2a103d, #1a081e)',
    backgroundAttachment: 'fixed',
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={backgroundStyles}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.8rem 1rem',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(24, 0, 48, 0.25)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >

        <h1
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "white",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <img
            src="https://raw.githubusercontent.com/KayokoProject/OnikataKayoko/main/default/Pic.jpg"
            alt="Logo"
            style={{ width: "36px", height: "36px", borderRadius: "50%" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          KayokoProject
        </h1>


        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Search ROM, creator, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...inputStyle,
              width: '100%',
              maxWidth: '18rem',
              flex: 1,
              padding: '0.5rem 0.75rem',
            }}
          />
          <GlowButton className="w-12 h-12 text-lg" onClick={() => setActiveTab(activeTab === 'user' ? 'home' : 'user')}>
            👤
          </GlowButton>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          width: '100%',
          paddingTop: '6rem',
          maxWidth: '1280px',
          margin: '0 auto',
          paddingBottom: '4rem',
          paddingLeft: '1rem',
          paddingRight: '1rem',
        }}
      >
        {activeTab === 'user' ? (
          <div className="transition-all duration-500 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 p-6" style={uploadCardStyle}>
              <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>User Menu</div>
              <div style={{ color: 'white', opacity: 0.9, marginBottom: '0.5rem' }}>Name: Kayoko User</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Manage your uploads and account.</div>
              <GlowButton className="w-full py-3" onClick={() => setActiveTab('upload')}>
                Open Upload Center
              </GlowButton>
            </div>
            <div className="lg:col-span-2">
              <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Your Uploaded Items</div>
              <div className="grid md:grid-cols-2 gap-6">
                {items.map((item) => (
                  <div key={item.id} style={cardStyle} className="relative flex flex-col">
                    <img src={item.thumbnail || DEFAULT_THUMBNAIL} alt={item.title} className="w-full h-44 object-cover rounded-t-3xl" />
                    <div className="p-5 flex flex-col flex-1">
                      <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'white' }}>{item.title}</div>
                      <p className="text-purple-100/70 text-sm mb-2">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'upload' ? (
          <div className="transition-all duration-500">
            <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>Upload Center</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="grid lg:grid-cols-1 gap-4 p-6" style={uploadCardStyle}>
                {['title', 'creator'].map((f) => (
                  <input
                    key={f}
                    style={inputStyle}
                    placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                    value={form[f]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f]: e.target.value }))}
                  />
                ))}

                <select style={inputStyle} value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
                  {CATEGORY_PRESETS.map((cat) => <option key={cat}>{cat}</option>)}
                </select>

                <input
                  style={inputStyle}
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />

                <div className="flex flex-col gap-3">
                  {/* Custom pill input */}
                  <input
                    type="text"
                    placeholder="Custom pill..."
                    value={customPill}
                    onChange={(e) => setCustomPill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomPill();
                      }
                    }}
                    style={{
                      ...inputStyle,
                      width: '100%',
                    }}
                  />

                  {/* Preset + history row */}
                  <div className="flex flex-wrap gap-3 items-center">
                    {PILL_PRESETS.map((pill) => (
                      <GlowButton
                        key={pill}
                        onClick={() => togglePill(pill)}
                        className={`px-4 py-2 ${form.pills.includes(pill)
                          ? 'ring-2 ring-purple-300 shadow-[0_0_18px_rgba(168,85,247,0.55)]'
                          : ''
                          }`}
                      >
                        {pill}
                      </GlowButton>
                    ))}

                    {/* History custom pill */}
                    {customPillHistory.map((pill) => (
                      <button
                        key={pill}
                        type="button"
                        onClick={() =>
                          setForm((prev) => {
                            const filtered = prev.pills.filter((p) =>
                              PILL_PRESETS.includes(p)
                            );

                            return {
                              ...prev,
                              pills: [...filtered, pill],
                            };
                          })
                        }
                        style={{
                          ...getPillStyle(pill),
                          borderRadius: '9999px',
                          padding: '0.55rem 1rem',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>

                <GlowButton className="w-full py-3" onClick={() => document.getElementById('thumbUploadInput')?.click()}>
                  Upload Thumbnail
                </GlowButton>
                <input id="thumbUploadInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setForm((prev) => ({ ...prev, thumbnail: e.target.files?.[0] || null }))} />
                <input
                  style={inputStyle}
                  placeholder="Masukkan URL ROM"
                  value={form.fileUrl}
                  onChange={(e) => setForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                />
                <input id="romFileUploadInput" type="file" style={{ display: 'none' }} onChange={(e) => setForm((prev) => ({ ...prev, fileData: e.target.files?.[0] || null, fileName: e.target.files?.[0]?.name || '' }))} />

                <GlowButton onClick={addItem} className="h-12 font-semibold text-lg">+ Tambah Port/Module</GlowButton>
              </div>

              <div style={uploadCardStyle} className="p-5 lg:sticky lg:top-28">
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '1rem',
                  }}
                >
                  Live Preview
                </div>

                <div className="relative mb-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-56 object-cover rounded-2xl"
                  />

                  {/* Category badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      ...getPillStyle(form.category),
                      borderRadius: '9999px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      color: 'white',
                      fontWeight: '600',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                  >
                    {form.category}
                  </div>
                </div>

                <div
                  style={{
                    fontWeight: '700',
                    fontSize: '1.4rem',
                    color: 'white',
                  }}
                >
                  {form.title || 'Module Title'}
                </div>

                <p className="text-purple-100/70 text-sm mt-2">
                  {form.description || 'Description preview akan tampil di sini...'}
                </p>

                <p className="text-xs text-purple-100/70 mt-2">
                  Creator: {form.creator || 'Unknown'}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {form.pills?.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          pills: prev.pills.filter((p) => p !== pill),
                        }))
                      }
                      style={{
                        ...getPillStyle(pill),
                        borderRadius: '9999px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        color: 'white',
                        fontWeight: '600',
                      }}
                    >
                      {pill} ✕
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} style={cardStyle} className="relative flex flex-col">
                <img src={item.thumbnail || DEFAULT_THUMBNAIL} alt={item.title} className="w-full h-44 object-cover rounded-t-3xl" />
                <div className="p-5 flex flex-col flex-1">
                  <div style={{ fontWeight: '700', fontSize: '1.5rem', color: 'white' }}>{item.title}</div>
                  <p className="text-purple-100/70 text-sm mb-2">{item.description}</p>
                  <p className="text-xs text-purple-100/70 mb-1">Creator: {item.creator}</p>
                  <div className="flex gap-2 mt-auto">
                    <GlowButton
                      onClick={() => {
                        if (!item.fileUrl) return;
                        window.open(item.fileUrl, '_blank'); // buka link
                      }}
                      className="flex-1 px-4 py-2"
                    >
                      Download
                    </GlowButton>
                    <GlowButton onClick={() => deleteItem(item.id)} className="px-4 py-2 delete-button">Hapus</GlowButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{ marginTop: 'auto', width: '100%', padding: '2rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)', borderTop: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(24, 0, 48, 0.25)' }}>
        <p style={{ color: 'white', fontWeight: '600' }}>© 2026 Kayoko Project — ROM Portal Downloader</p>
        <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Built with React + Vite • Secure File Sharing • Public Ready</p>
      </footer>
    </div>
  );
}
