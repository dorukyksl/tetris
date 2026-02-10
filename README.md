# 🎮 Tetris

Klasik Tetris oyunu - HTML5 Canvas ile yapılmış, mobil uyumlu.

![Tetris](https://img.shields.io/badge/Game-Tetris-00ff88?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange?style=for-the-badge)
![Mobile](https://img.shields.io/badge/Mobile-Friendly-blue?style=for-the-badge)

## 🚀 Özellikler

- ✅ Klasik Tetris mekanikleri
- ✅ Skor, seviye ve satır sayacı
- ✅ Sonraki parça önizlemesi
- ✅ Ghost piece (parçanın nereye düşeceğini gösterir)
- ✅ Touch kontroller (butonlar + swipe desteği)
- ✅ Klavye desteği (PC için)
- ✅ Pause/Resume
- ✅ Seviye arttıkça hız artıyor
- ✅ Responsive tasarım

## 🎯 Kontroller

### Mobil (Touch)
| Kontrol | Aksiyon |
|---------|---------|
| ◀ Butonu | Sola hareket |
| ▶ Butonu | Sağa hareket |
| ▼ Butonu | Soft drop |
| ↻ Butonu | Döndür |
| BIRAK Butonu | Hard drop |
| Sağa/Sola Swipe | Hareket |
| Aşağı Swipe | Soft drop |
| Uzun Aşağı Swipe | Hard drop |
| Tap | Döndür |

### PC (Klavye)
| Tuş | Aksiyon |
|-----|---------|
| ← → | Sola/Sağa hareket |
| ↓ | Soft drop |
| ↑ | Döndür |
| Space | Hard drop |
| P / Escape | Pause |

## 🛠️ Kurulum

### Basit Kullanım
```bash
# Repoyu klonla
git clone https://github.com/dorukyksl/tetris.git
cd tetris

# Herhangi bir HTTP sunucusu ile çalıştır
npx serve www
# veya
python -m http.server 8080 -d www
```

### Android APK Oluşturma (Capacitor)
```bash
# Bağımlılıkları yükle
npm install @capacitor/core @capacitor/cli @capacitor/android

# Capacitor'ı başlat
npx cap init Tetris com.doruk.tetris --web-dir www

# Android platformunu ekle
npx cap add android

# Android Studio'da aç
npx cap open android
```

## 📁 Dosya Yapısı

```
tetris/
├── www/
│   ├── index.html    # Ana HTML dosyası
│   ├── style.css     # Stiller
│   └── game.js       # Oyun mantığı
├── package.json
└── README.md
```

## 🎨 Skorlama

| Satır | Puan |
|-------|------|
| 1 satır | 100 × seviye |
| 2 satır | 300 × seviye |
| 3 satır | 500 × seviye |
| 4 satır (Tetris!) | 800 × seviye |

- Soft drop: +1 puan/satır
- Hard drop: +2 puan/satır

## 📱 Ekran Görüntüleri

Oyun mobil cihazlar için optimize edilmiştir ve tüm ekran boyutlarına uyum sağlar.

## 🔧 Teknolojiler

- HTML5 Canvas
- Vanilla JavaScript
- CSS3 (Flexbox, Gradients)
- Touch Events API

## 📄 Lisans

MIT License - Özgürce kullanabilirsiniz!

---

Made with ❤️ by Doruk
