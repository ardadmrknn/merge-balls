# Merge Guys

A physics-based, mobile-first Suika-style merge game built purely with Vanilla JavaScript, HTML5 Canvas, and Matter.js.

**[Hemen Oynamak İçin Tıklayın / Play Now!](https://ardadmrknn.github.io/merge-balls/)**

---

## Özellikler / Features

### 15 Evrim Seviyesi
Tiny'den Celestial'a uzanan devasa bir evrim zinciri. Her seviye benzersiz renklere, boyutlara ve puan değerlerine sahip:

| # | İsim | Puan |
|---|------|------|
| 0 | Tiny | 2 |
| 1 | Small | 4 |
| 2 | Medium | 8 |
| 3 | Large | 16 |
| 4 | X-Large | 32 |
| 5 | Huge | 64 |
| 6 | Giant | 128 |
| 7 | Mega | 256 |
| 8 | Ultra | 512 |
| 9 | Supreme | 1024 |
| 10 | Titan | 2048 |
| 11 | Divine | 4096 |
| 12 | Cosmic | 8192 |
| 13 | Eternal | 16384 |
| 14 | Celestial | 32768 |

### Fizik ve Mekanikler
*   **Dinamik Kütle:** Topların özkütleleri ve hava dirençleri seviyeyle birlikte artar. Büyük toplar ağır ve yavaş süzülür, küçükler hızla diplere iner.
*   **Akıllı Geliş Sistemi:** Ağırlıklı rastgele algoritma ile küçük toplar daha sık gelir. Kutu tıkanmadan uzun oyunlar mümkün.
*   **Kombo Sistemi:** Ardışık birleştirmeler puan çarpanı ve enerji bonusu kazandırır. 3x ve üzeri kombolar altın efektlerle gösterilir.
*   **Sepet Genişleme:** 60.000 puana ulaşınca sepet otomatik olarak genişler.
*   **Gelişmiş Efektler:** Ekran sarsıntısı, patlayan parçacıklar, neon parlamalar, floating skor yazıları.
*   **Haptic Feedback:** Mobil cihazlarda titreşim desteği (Web Vibration API).
*   **Prosedürel Ses:** Web Audio API ile osilatör tabanlı ses efektleri (harici dosya gerektirmez).
*   **Arkaplan Müziği:** `dark.mp3` dosyası ile atmosferik müzik, ses açma/kapama butonu ile kontrol edilir.

---

## Aktif Yetenek Sistemi (8 Yetenek)

Başarılı birleştirmeler ve kombolar enerji kazandırır (Maks. 100). Pasif rejenerasyon: saniyede +0.4 enerji. Yetenekler enerji panelinden seçilerek kullanılır.

| # | Yetenek | Enerji | Tür | Açıklama |
|---|---------|--------|-----|----------|
| 1 | **Deprem** | 30 | Anında | Tüm topları rastgele devasa kuvvetlerle savurur. Topların dışarı uçmaması için sepet ağzına geçici bir kalkan/kapak oluşturulur. 2.5 saniye sürer. |
| 2 | **Joker / Evrim** | 40 | Hedefli | Seçilen herhangi bir topu bir üst seviyeye evrimleştirir. Altın parçacık efekti ve bonus skor verir. |
| 3 | **Bölünme (Split)** | 40 | Hedefli | Seçilen topu yok edip, bir alt seviyeden 2 yeni top oluşturur. Level 0 topları doğrudan yok eder. Alanı boşaltmak için idealdir. |
| 4 | **Zaman Dondurma** | 25 | Anında | Sepetteki tüm mevcut topları 5 saniye boyunca yerinde dondurur. Bu sürede yeni toplar bırakılabilir ve dondurulmuş toplara çarpıp birleşebilir. Buz halka efekti gösterilir. |
| 5 | **Kaos Topu** | 40 | Anında | Sepete "?" işaretli mor gezici bir top bırakır. 4 saniye boyunca dokunduğu topları otomatik olarak bir üst seviyeye evrimleştirir (maks. 3 dokunma, sadece level 0-8 arası). |
| 6 | **Zincirleme Bomba** | 30 | Hedefli | Seçilen topun aynı seviyedeki TÜM kopyalarını aynı anda patlatır. Patlama dalgası çevredeki topları iter. |
| 7 | **Mıknatıs** | 40 | Anında | 7 saniye boyunca aynı seviyedeki topları birbirine çeken manyetik kuvvet alanı oluşturur. Mavi kesikli çizgilerle bağlantılar görselleştirilir. |
| 8 | **Takas** | 30 | Hedefli (2 top) | İki topun pozisyonlarını değiştirir. İlk topa, sonra ikinci topa tıklanır. Stratejik konumlandırma için kullanılır. |

---

## Teknolojiler / Tech Stack

*   **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **Fizik Motoru:** [Matter.js](https://brm.io/matter-js/) v0.19.0 (CDN üzerinden)
*   **Grafik:** HTML5 `<canvas>` API (Custom rendering, gradient tabanlı toplar, yüz ifadeleri)
*   **Ses:** Web Audio API (Prosedürel osilatörler) + `dark.mp3` (Arkaplan müziği)
*   **Font:** [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts)
*   **Performans:** 4x sub-stepping fizik simülasyonu, render cache, canvas donanımsal hızlandırma
*   **Tasarım:** Glassmorphism UI, neon efektli sepet, modern karanlık tema

---

## Nasıl Oynanır? / How to Play

1.  Oyun alanına dokunarak/tıklayarak topları bırakın.
2.  Aynı boyuttaki iki top birbirine değdiğinde bir üst seviye topa dönüşür ve puan verir.
3.  Toplar sepetten dışarı düşerse (sol/sağ/alt sınırlar dışına çıkarsa) oyun biter.
4.  Ardışık birleştirmeler **KOMBO** yapar → Ekstra puan çarpanı + enerji bonusu.
5.  Kazandığınız enerjiyi alt paneldeki **8 yeteneğe** harcayarak strateji geliştirin.

---

## Yerel Kurulum / Local Setup

Geliştirme veya oynama için yerel bir HTTP sunucusu başlatın (ES6 modülleri ve CORS nedeniyle `file://` düzgün çalışmaz):

```bash
npx http-server . -p 8889 -o
```

Ardından tarayıcınızda `http://127.0.0.1:8889` adresine gidin.

### Mobil Cihazda Oynama
Aynı Wi-Fi ağına bağlı iken terminalde görünen IP adresini telefonunuzun tarayıcısına yazarak tam ekran mobil deneyimi (haptic feedback dahil) yaşayabilirsiniz.

---

## Proje Yapısı / Project Structure

```
oyun/
├── index.html          # Ana iskelet, yetenek butonları, DOM elementleri
├── style.css           # Glassmorphism arayüz, animasyonlu butonlar, karanlık tema
├── game.js             # Oyun motoru (~2630 satır): Matter.js fizik, çarpışma, 
│                       #   8 yetenek sistemi, kombo, rendering, game loop
├── dark.mp3            # Arkaplan müziği
├── README.md           # Bu dosya
└── önemsiz/            # Eski notlar ve referans dosyaları
    ├── old_game_concept.md
    └── old_physics_reference.md
```

---

## Git Deposuna Bağlama / Connecting to a Repository

Bu proje henüz bir Git deposu değil. Mevcut bir GitHub reposuna bağlamak için aşağıdaki adımları izleyin:

### 1. Git'i Başlatın
```bash
cd "c:\Users\arda demirkan\Desktop\oyun"
git init
```

### 2. .gitignore Oluşturun (Opsiyonel)
```bash
echo node_modules/ > .gitignore
echo .DS_Store >> .gitignore
```

### 3. Dosyaları Staging'e Ekleyin
```bash
git add .
```

### 4. İlk Commit'i Yapın
```bash
git commit -m "Initial commit: Merge Guys v2 - 15 level, 8 yetenek"
```

### 5. Mevcut GitHub Reposuna Bağlayın
GitHub'da zaten `merge-balls` (veya başka isimde) bir reponuz varsa:
```bash
git remote add origin https://github.com/ardadmrknn/merge-balls.git
```

### 6. Push Edin
```bash
# İlk push (upstream branch ayarla)
git branch -M main
git push -u origin main
```

> **Not:** Eğer remote repoda zaten dosyalar varsa ve çakışma oluyorsa:
> ```bash
> git pull origin main --allow-unrelated-histories
> ```
> komutuyla önce birleştirin, sonra push edin.

### GitHub Pages ile Yayınlama
Repo ayarlarından **Settings → Pages → Source: main branch** seçerek otomatik olarak `https://ardadmrknn.github.io/merge-balls/` adresinde yayınlayabilirsiniz.

---

*Geliştirme ve Tasarım: Arda Demirkan // Merge Guys v2*
