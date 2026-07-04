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
    textSayfaGosterge.innerText = `Sayfa: ${aktifIndex + 1}`;
    
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
    if (!isNaN(girilenSayfa) && girilenSayfa >= 1 && girilenSayfa <= (MAKSIMUM_INDEX + 1)) {
        sayfayiYukle(girilenSayfa - 1);
    }
});

// Sure ve Cüz Verileri
const sureler = [ { ad: "1. Fatiha", index: 0 }, { ad: "2. Bakara", index: 1 }, { ad: "3. Bakara", index: 1 }, { ad: "4. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "8. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "12. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "16. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "20. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "24. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "28. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "32. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "36. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "40. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "44. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "48. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "52. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "56. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "60. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "64. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "68. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "72. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "76. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "80. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "84. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "88. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "92. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "96. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "100. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "104. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "108. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 }, { ad: "112. Bakara", index: 1 }, 
                 { ad: "2. Bakara", index: 1 }, { ad: "2. Bakara", index: 1 } ]; // Kendi verilerinizi ekleyin
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

