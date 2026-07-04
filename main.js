// Firebase v9 Modüler SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// BURAYI KENDİ FIREBASE AYARLARINIZLA DEĞİŞTİRİN
const firebaseConfig = {
    apiKey: "AIzaSyBBIJlA_L4UoNLtKIxv6K-aQpADJ2Kx_hc",
    authDomain: "kuran-8fba4.firebaseapp.com",
    projectId: "kuran-8fba4",
    storageBucket: "kuran-8fba4.firebasestorage.app",
    messagingSenderId: "761001080952",
    appId: "1:761001080952:web:04957cfa153445f839d58d",
    measurementId: "G-Z7N8WRV8CE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Sayfa ve Hatim Değişkenleri
const MAKSIMUM_INDEX = 608; 
let aktifIndex = 0;
let mevcutKullanici = null;

// YENİ: Hatim Verileri
let aktifHatim = "hatim1";
let hatimKayitlari = {
    hatim1: 0,
    hatim2: 0,
    hatim3: 0,
    hatim4: 0,
    hatim5: 0
};

// DOM Elementleri
const imgKuranSayfasi = document.getElementById('kuranSayfasi');
const textSayfaGosterge = document.getElementById('sayfaGosterge');
const btnGiris = document.getElementById('btnGiris');
const kullaniciBilgi = document.getElementById('kullaniciBilgi');
const btnCikis = document.getElementById('btnCikis');
const hatimSelect = document.getElementById('hatimSecim');

// --- VERİTABANI İŞLEMLERİ ---

async function sayfayiKaydet(index) {
    // Önce lokal değişkenimizi güncelliyoruz
    hatimKayitlari[aktifHatim] = index;

    if (mevcutKullanici) {
        try {
            await setDoc(doc(db, "kullanicilar", mevcutKullanici.uid), {
                hatimKayitlari: hatimKayitlari,
                aktifHatim: aktifHatim
            }, { merge: true });
        } catch (e) {
            console.error("Kaydedilemedi: ", e);
        }
    } else {
        // Kullanıcı giriş yapmamışsa cihazın hafızasına kaydet
        localStorage.setItem('kuran_hatim_kayitlari', JSON.stringify(hatimKayitlari));
        localStorage.setItem('kuran_aktif_hatim', aktifHatim);
    }
}

async function sonSayfayiGetir() {
    if (mevcutKullanici) {
        const docRef = doc(db, "kullanicilar", mevcutKullanici.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().hatimKayitlari) {
            hatimKayitlari = docSnap.data().hatimKayitlari;
            aktifHatim = docSnap.data().aktifHatim || "hatim1";
        }
    }
    
    // Arayüzü ve sayfayı güncelle
    hatimSelect.value = aktifHatim;
    sayfayiYukle(hatimKayitlari[aktifHatim], false);
}

// --- SAYFA YÖNETİMİ ---

function sayfayiYukle(index, kaydet = true) {
    if (index < 0) index = 0;
    if (index > MAKSIMUM_INDEX) index = MAKSIMUM_INDEX;

    aktifIndex = index;
    imgKuranSayfasi.src = `page/${aktifIndex}.jpg`;
    textSayfaGosterge.innerText = `Sayfa: ${aktifIndex}`;
    
    if(kaydet) sayfayiKaydet(aktifIndex);
}

// YENİ: Hatim Değiştirme Olayı
hatimSelect.addEventListener('change', (e) => {
    aktifHatim = e.target.value;
    // Seçilen hatimin kaldığı sayfayı yükle ve durumu veritabanına kaydet
    sayfayiYukle(hatimKayitlari[aktifHatim], true);
});

// --- KİMLİK DOĞRULAMA (AUTH) ---

onAuthStateChanged(auth, (user) => {
    if (user) {
        mevcutKullanici = user;
        btnGiris.classList.add('hidden');
        kullaniciBilgi.classList.remove('hidden');
        
        document.getElementById('profilFoto').src = user.photoURL;
        document.getElementById('kullaniciAdi').innerText = user.displayName.split(' ')[0];
        
        sonSayfayiGetir();
    } else {
        mevcutKullanici = null;
        btnGiris.classList.remove('hidden');
        kullaniciBilgi.classList.add('hidden');
        
        // Çıkış yapıldıysa veya misafirse localstorage'dan devam et
        const localKayitlar = localStorage.getItem('kuran_hatim_kayitlari');
        const localAktif = localStorage.getItem('kuran_aktif_hatim');
        
        if(localKayitlar) hatimKayitlari = JSON.parse(localKayitlar);
        if(localAktif) aktifHatim = localAktif;

        hatimSelect.value = aktifHatim;
        sayfayiYukle(hatimKayitlari[aktifHatim], false);
    }
});

// Buton Olayları
btnGiris.addEventListener('click', () => signInWithPopup(auth, provider));
btnCikis.addEventListener('click', () => signOut(auth));

document.getElementById('btnSonraki').addEventListener('click', () => sayfayiYukle(aktifIndex + 1));
document.getElementById('btnOnceki').addEventListener('click', () => sayfayiYukle(aktifIndex - 1));

document.getElementById('btnSayfaGit').addEventListener('click', () => {
    const girilenSayfa = parseInt(document.getElementById('sayfaInput').value);
    if (!isNaN(girilenSayfa) && girilenSayfa >= 0 && girilenSayfa <= (MAKSIMUM_INDEX)) {
        sayfayiYukle(girilenSayfa);
    }
});

// Sure ve Cüz Verileri

// --- SURELER (114 Sure - Index değerleri sayfa numarasının 1 eksiğidir) ---
const sureler = [{ ad: "1. Fatiha", index: 0 }, { ad: "2. Bakara", index: 1 }, { ad: "3. Âl-i İmrân", index: 49 },
                { ad: "4. Nisâ", index: 76 }, { ad: "5. Mâide", index: 105 }, { ad: "6. En'âm", index: 127 },
                { ad: "7. A'râf", index: 150 }, { ad: "8. Enfâl", index: 176 }, { ad: "9. Tevbe", index: 186 },
                { ad: "10. Yûnus", index: 207 }, { ad: "11. Hûd", index: 220 }, { ad: "12. Yûsuf", index: 234 },
                { ad: "13. Ra'd", index: 248 }, { ad: "14. İbrâhîm", index: 254 }, { ad: "15. Hicr", index: 261 },
                { ad: "16. Nahl", index: 266 }, { ad: "17. İsrâ", index: 281 }, { ad: "18. Kehf", index: 292 },
                { ad: "19. Meryem", index: 304 }, { ad: "20. Tâhâ", index: 311 }, { ad: "21. Enbiyâ", index: 321 },
                { ad: "22. Hac", index: 331 }, { ad: "23. Mü'minûn", index: 341 }, { ad: "24. Nûr", index: 349 },
                { ad: "25. Furkân", index: 358 }, { ad: "26. Şuarâ", index: 366 }, { ad: "27. Neml", index: 376 },
                { ad: "28. Kasas", index: 384 }, { ad: "29. Ankebût", index: 395 }, { ad: "30. Rûm", index: 403 },
                { ad: "31. Lokmân", index: 410 }, { ad: "32. Secde", index: 414 }, { ad: "33. Ahzâb", index: 417 },
                { ad: "34. Sebe'", index: 427 }, { ad: "35. Fâtır", index: 433 }, { ad: "36. Yâsîn", index: 439 },
                { ad: "37. Sâffât", index: 445 }, { ad: "38. Sâd", index: 452 }, { ad: "39. Zümer", index: 457 },
                { ad: "40. Mü'min (Ğâfir)", index: 466 }, { ad: "41. Fussilet", index: 476 }, { ad: "42. Şûrâ", index: 482 },
                { ad: "43. Zuhruf", index: 488 }, { ad: "44. Duhân", index: 495 }, { ad: "45. Câsiye", index: 498 },
                { ad: "46. Ahkâf", index: 501 }, { ad: "47. Muhammed", index: 506 }, { ad: "48. Fetih", index: 510 },
                { ad: "49. Hucurât", index: 514 }, { ad: "50. Kâf", index: 517 }, { ad: "51. Zâriyât", index: 519 },
                { ad: "52. Tûr", index: 522 }, { ad: "53. Necm", index: 525 }, { ad: "54. Kamer", index: 527 },
                { ad: "55. Rahmân", index: 530 }, { ad: "56. Vâkıa", index: 533 }, { ad: "57. Hadîd", index: 536 },
                { ad: "58. Mücâdele", index: 541 }, { ad: "59. Haşr", index: 544 }, { ad: "60. Mümtehine", index: 548 },
                { ad: "61. Saff", index: 550 }, { ad: "62. Cuma", index: 552 }, { ad: "63. Münâfikûn", index: 553 },
                { ad: "64. Teğâbün", index: 555 }, { ad: "65. Talâk", index: 557 }, { ad: "66. Tahrîm", index: 559 },
                { ad: "67. Mülk", index: 561 }, { ad: "68. Kalem", index: 563 }, { ad: "69. Hâkka", index: 565 },
                { ad: "70. Meâric", index: 567 }, { ad: "71. Nûh", index: 569 }, { ad: "72. Cin", index: 571 },
                { ad: "73. Müzzemmil", index: 573 }, { ad: "74. Müddessir", index: 574 }, { ad: "75. Kıyâme", index: 576 },
                { ad: "76. İnsân", index: 577 }, { ad: "77. Mürselât", index: 579 }, { ad: "78. Nebe'", index: 581 },
                { ad: "79. Nâziât", index: 582 }, { ad: "80. Abese", index: 584 }, { ad: "81. Tekvîr", index: 585 },
                { ad: "82. İnfitâr", index: 586 }, { ad: "83. Mutaffifîn", index: 587 }, { ad: "84. İnşikâk", index: 588 },
                { ad: "85. Bürûc", index: 589 }, { ad: "86. Târık", index: 590 }, { ad: "87. A'lâ", index: 591 },
                { ad: "88. Ğâşiye", index: 591 }, { ad: "89. Fecr", index: 592 }, { ad: "90. Beled", index: 593 },
                { ad: "91. Şems", index: 594 }, { ad: "92. Leyl", index: 595 }, { ad: "93. Duhâ", index: 595 },
                { ad: "94. İnşirâh", index: 596 }, { ad: "95. Tîn", index: 596 }, { ad: "96. Alak", index: 597 },
                { ad: "97. Kadir", index: 598 }, { ad: "98. Beyyine", index: 598 }, { ad: "99. Zilzâl", index: 599 },
                { ad: "100. Âdiyât", index: 599 }, { ad: "101. Kâria", index: 600 }, { ad: "102. Tekâsür", index: 600 },
                { ad: "103. Asr", index: 601 }, { ad: "104. Hümeze", index: 601 }, { ad: "105. Fîl", index: 601 },
                { ad: "106. Kureyş", index: 602 }, { ad: "107. Mâûn", index: 602 }, { ad: "108. Kevser", index: 602 },
                { ad: "109. Kâfirûn", index: 603 }, { ad: "110. Nasr", index: 603 }, { ad: "111. Tebbet", index: 603 },
                { ad: "112. İhlâs", index: 604 }, { ad: "113. Felak", index: 604 }, { ad: "114. Nâs", index: 604 }]; // Kendi verilerinizi ekleyin
const cuzler = [ { ad: "01. Cüz", index: 0 }, { ad: "02. Cüz", index: 21 }, { ad: "03. Cüz", index: 41 }, { ad: "04. Cüz", index: 61 }, { ad: "05. Cüz", index: 81 }, 
                { ad: "06. Cüz", index: 101 }, { ad: "07. Cüz", index: 121 }, { ad: "08. Cüz", index: 141 }, { ad: "09. Cüz", index: 161 }, { ad: "10. Cüz", index: 181 }, 
                { ad: "11. Cüz", index: 201 }, { ad: "12. Cüz", index: 221 }, { ad: "13. Cüz", index: 241 }, { ad: "14. Cüz", index: 261 }, { ad: "15. Cüz", index: 281 }, 
                { ad: "16. Cüz", index: 301 }, { ad: "17. Cüz", index: 321 }, { ad: "18. Cüz", index: 341 }, { ad: "19. Cüz", index: 361 }, { ad: "20. Cüz", index: 381 }, 
                { ad: "21. Cüz", index: 401 }, { ad: "22. Cüz", index: 421 }, { ad: "23. Cüz", index: 441 }, { ad: "24. Cüz", index: 461 }, { ad: "25. Cüz", index: 481 }, 
                { ad: "26. Cüz", index: 501 }, { ad: "27. Cüz", index: 521 }, { ad: "28. Cüz", index: 541 }, { ad: "29. Cüz", index: 561 }, { ad: "30. Cüz", index: 581 } ]; // Kendi verilerinizi ekleyin

const sureSelect = document.getElementById('sureSecim');
sureler.forEach(sure => { sureSelect.innerHTML += `<option value="${sure.index}">${sure.ad}</option>`; });
sureSelect.addEventListener('change', (e) => { if(e.target.value !== "") sayfayiYukle(parseInt(e.target.value)); });

const cuzSelect = document.getElementById('cuzSecim');
cuzler.forEach(cuz => { cuzSelect.innerHTML += `<option value="${cuz.index}">${cuz.ad}</option>`; });
cuzSelect.addEventListener('change', (e) => { if(e.target.value !== "") sayfayiYukle(parseInt(e.target.value)); });

