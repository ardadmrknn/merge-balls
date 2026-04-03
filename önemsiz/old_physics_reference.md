Jelly (Soft-Body) Physics Implementation Recipe

Bu doküman, Matter.js kullanarak toplara nasıl "jel" kıvamı verileceğini açıklar.

1. Temel Mantık: Composite Body (Bileşik Gövde)

Matter.js'de jöle kıvamı, tek bir daire yerine bir grup küçük noktanın (parçacığın) birbirine yaylar (constraints) ile bağlanmasıyla oluşturulur.

Kullanılacak Fonksiyon: Composites.softBody

Matter.js içinde hazır bulunan bu fonksiyonu kullanarak bir ağ (mesh) yapısı oluşturmalısın:

Parçacıklar: Topun dış yüzeyini oluşturan küçük kütleler.

Yaylar (Constraints): Bu parçacıkları birbirine bağlayan, esneme katsayısı (stiffness) düşük bağlantılar.

2. Teknik Parametreler (Jöle Kıvamı İçin)

AI Agent'ın kodu yazarken şu değerleri hedeflemelidir:

Stiffness (Sertlik): $0.1$ ile $0.4$ arası. (Daha düşük değer = daha fazla jöle efekti).

Damping (Sönümleme): $0.05$. (Topun sonsuza kadar titremesini engeller).

Friction (Sürtünme): $0.01$. (Topların birbirinin üzerinden kayması için).

Restitution (Zıplama): $0.6$. (Enerjiyi korur ama jöle gibi emer).

3. Kod Mimarisi Değişikliği

AI Agent'a şu talimatı ver:
"Standart Bodies.circle yerine, Matter.Composites.softBody(x, y, columns, rows, columnGap, rowGap, crossBrace, particleRadius, particleOptions, constraintOptions) fonksiyonunu kullanarak dairesel bir yumuşak gövde oluştur."

Önemli: Dairesel Formu Korumak

Kare bir mesh yerine dairesel bir form istiyorsan, AI Agent'a şunları yaptır:

Merkezde tek bir ana gövde (çekirdek) oluştur.

Etrafına bir çember şeklinde dış parçacıklar diz.

Tüm dış parçacıkları merkeze "Elastic Constraints" ile bağla.

4. Görselleştirme (Rendering)

Jel efektinin güzel görünmesi için parçacıkları değil, bu parçacıkları çevreleyen "Hull" (Dış Kabuk) yapısını çizdirmelisin.

Her karede (frame), dış parçacıkların koordinatlarını al.

context.beginPath() ve context.bezierCurveTo() kullanarak bu noktaları yumuşak bir eğriyle birleştir.

İçini gradyan (gradient) ile doldurursan derinlik algısı artar.

5. Merge Çakışma Önlemi

Yumuşak gövdeler birleşirken fizik motoru kararsızlaşabilir.

Çözüm: Birleşme anında jöle yapısını anlık olarak dondur veya yeni oluşan üst seviye topu bir "pop" animasyonu ile (anlık büyüme) oluşturarak fizik motoruna yer aç.