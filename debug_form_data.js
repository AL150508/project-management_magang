// Script untuk debug form data di browser console
// Jalankan di browser console saat form DUDI terbuka

console.log("🔍 Debug Form Data...");

// Test 1: Cek apakah form element ada
const form = document.querySelector('form');
if (form) {
  console.log("✅ Form element ditemukan");
} else {
  console.log("❌ Form element tidak ditemukan");
}

// Test 2: Cek input fields
const inputs = document.querySelectorAll('input, textarea, select');
console.log(`📝 Ditemukan ${inputs.length} input fields:`);
inputs.forEach((input, index) => {
  console.log(`${index + 1}. ${input.name || input.id || 'unnamed'}: "${input.value}"`);
});

// Test 3: Cek apakah ada data di localStorage atau sessionStorage
console.log("💾 LocalStorage:", localStorage);
console.log("💾 SessionStorage:", sessionStorage);

// Test 4: Cek apakah ada user data di window object
if (window.user) {
  console.log("👤 Window user:", window.user);
} else {
  console.log("❌ Tidak ada window.user");
}
