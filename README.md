# Merge Guys 🟣🔵🟢

A physics-based, mobile-first Suika-style merge game built purely with Vanilla JavaScript, HTML5 Canvas, and Matter.js. 

🌟 **[Hemen Oynamak İçin Tıklayın (Play Now!)](https://ardadmrknn.github.io/merge-balls/)** 🌟

## 🎮 Özellikler (Features)

*   **Soft-Body/Jelly Fiziği:** Toplar statik daireler değildir. Çarpışmalarda esner, havada süzülürken rüzgar direnciyle damla (teardrop) şeklini alır. Katılığın ve akışkanlığın (%60/%40) mükemmel dengesi.
*   **Aerodinamik Yerçekimi:** Özel spring-damper simülasyonu sayesinde daha doğal ve hissedilebilir düşüş.
*   **Ağırlıklı Geliş Sistemi:** Küçük boyutlu topların gelme sıklığı akıllı bir algoritma ile ayarlandırıldı (%35 Tiny, %30 Small, vb.). Böylece boşluklar kolayca doldurulur, oyun tıkanmaz.
*   **Küçük Top Optimizasyonu:** Küçük topların özkütlesi oransal olarak artırıldı, büyük topların arasına kurşun misali rahatça sızabilirler.
*   **Gelişmiş Animasyonlar:** Ekran sarsıntısı, patlayan parçacıklar, neon iç ve dış parlamalar. Halka (ring) ve yavaşlayan flash efektleri.
*   **Mobil Odaklı Tasarım:** Tamamen duyarlı (responsive) UI, parmak boyutları göz önüne alınarak tasarlanmış kontroller.
*   **Kombo ve Hissiyat:** Ardışık birleşmelerde artan kombo çarpanı. Web Audio API destekli prosedürel ses efektleri. Cihaz uyumlu titreşim (Haptic Feedback).

## 🛠️ Teknolojiler (Tech Stack)

*   **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **Fizik Motoru:** [Matter.js](https://brm.io/matter-js/) (v0.19.0)
*   **Grafik:** HTML5 `<canvas>` API (Custom Bezier Hull rendering)
*   **Ses:** Web Audio API (Prosedürel osilatörler kullanılmış, dış ses dosyasına ihtiyaç duymaz)

## 🚀 Nasıl Oynanır? (How to Play)

1.  Oyun alanına dokunarak/tıklayarak topları rastgele düşürün.
2.  Aynı renkteki/boyuttaki iki top birbirine değdiğinde daha büyük bir topa dönüşür ve puan verir.
3.  Toplar üst kısımdaki ağız sınırını aşarsa oyun biter.
4.  Ardışık olarak hızlıca topları birleştirirseniz "KOMBO" yapar ve ekstra puan çarpanı kazanırsınız.

### 💻 Nasıl Çalıştırılır? / Local Setup

Geliştirme veya oynama amacı ile yerel bir sunucu çalıştırmanız gerekir (JavaScript'in ES6 modülleri ve güvenlik önlemleri nedeniyle `file://` protokolü hatasız çalışmayabilir).

NPM kurulu ise terminal/komut satırından proje dizininde şunu çalıştırın:
```bash
npx http-server . -p 8889 -o
```
Ardından tarayıcınızda `http://127.0.0.1:8889` adresine gidebilirsiniz.

### 📱 Mobil Cihazda Oynama
Aynı Wi-Fi ağına bağlı iken terminalde görünen IP adresinizi telefonunuzun tarayıcısına yazarak mobil üzerinde tam ekran deneyimle oynayabilirsiniz.

## 📁 Proje Yapısı

*   `index.html`: Oyunun ana iskeleti ve DOM elementleri.
*   `style.css`: Renk paletleri, modern fontlar (Outfit) ve UI tasarımları.
*   `game.js`: Tüm oyun motoru, Matter.js entegrasyonu, soft-body matematiksel çizimleri ve oyun döngüsü.
*   `old_game_concept.md` & `old_physics_reference.md`: Oyunun ilk yapım aşamasında kullanılan tarif ve plan dokümanları.

---

*Geliştirme: Arda Demirkan // Merge Guys*
