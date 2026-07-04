// Firebase v9 Modüler SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// BURAYI KENDİ FIREBASE AYARLARINIZLA DEĞİŞTİRİN
const firebaseConfig = {
    apiKey: "SİZİN_API_KEYİNİZ",
    authDomain: "proje-id.firebaseapp.com",
    projectId: "proje-id",
    storageBucket: "proje-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdefg"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Sayfa Değişkenleri
const MAKSIMUM_INDEX = 608; 
let aktifIndex = 0;
let mevcutKullanici = null;

// DOM Elementleri
const imgKuranSayfasi = document.getElementById('kuranSayfasi');
const textSayfaGosterge = document.getElementById('sayfaGosterge');
const btnGiris = document.getElementById('btnGiris');
const kullaniciBilgi = document.getElementById('kullaniciBilgi');
const btnCikis = document.getElementById('btnCikis');

// --- VERİTABANI İŞLEMLERİ ---

// Sayfa değiştiğinde veritabanına kaydet
async function sayfayiKaydet(index) {
    if (mevcutKullanici) {
        try {
            await setDoc(doc(db, "kullanicilar", mevcutKullanici.uid), {
                sonSayfaIndex: index
            }, { merge: true });
        } catch (e) {
            console.error("Kaydedilemedi: ", e);
        }
    } else {
        // Kullanıcı giriş yapmamışsa sadece o cihaza kaydet
        localStorage.setItem('kuran_son_index', index);
    }
}

// Giriş yapıldığında veritabanından son sayfayı çek
async function sonSayfayiGetir() {
    if (mevcutKullanici) {
        const docRef = doc(db, "kullanicilar", mevcutKullanici.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().sonSayfaIndex !== undefined) {
            sayfayiYukle(docSnap.data().sonSayfaIndex, false);
        } else {
            sayfayiYukle(0, false);
        }
    }
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

// --- KİMLİK DOĞRULAMA (AUTH) ---

// Kullanıcı durumunu dinle (Giriş yaptı mı, çıktı mı?)
onAuthStateChanged(auth, (user) => {
    if (user) {
        mevcutKullanici = user;
        btnGiris.classList.add('hidden');
        kullaniciBilgi.classList.remove('hidden');
        
        document.getElementById('profilFoto').src = user.photoURL;
        document.getElementById('kullaniciAdi').innerText = user.displayName.split(' ')[0]; // Sadece ilk ismi yaz
        
        sonSayfayiGetir();
    } else {
        mevcutKullanici = null;
        btnGiris.classList.remove('hidden');
        kullaniciBilgi.classList.add('hidden');
        
        // Çıkış yapıldıysa localstorage'dan devam et
        const localSon = localStorage.getItem('kuran_son_index');
        sayfayiYukle(localSon !== null ? parseInt(localSon) : 0, false);
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
const sureler = [ { ad: "1. Fatiha", index: 0 }, { ad: "2. Bakara", index: 1 } ]; // Kendi verilerinizi ekleyin
const cuzler = [ { ad: "1. Cüz", index: 0 }, { ad: "2. Cüz", index: 21 } ]; // Kendi verilerinizi ekleyin

const sureSelect = document.getElementById('sureSecim');
sureler.forEach(sure => { sureSelect.innerHTML += `<option value="${sure.index}">${sure.ad}</option>`; });
sureSelect.addEventListener('change', (e) => { if(e.target.value !== "") sayfayiYukle(parseInt(e.target.value)); });

const cuzSelect = document.getElementById('cuzSecim');
cuzler.forEach(cuz => { cuzSelect.innerHTML += `<option value="${cuz.index}">${cuz.ad}</option>`; });
cuzSelect.addEventListener('change', (e) => { if(e.target.value !== "") sayfayiYukle(parseInt(e.target.value)); });
